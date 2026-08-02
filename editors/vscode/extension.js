"use strict";

const fs = require("node:fs");
const path = require("node:path");

let client;

function executableCandidates(value, platform, env) {
  if (platform !== "win32" || path.extname(value)) {
    return [value];
  }
  const extensions = (env.PATHEXT || ".EXE;.CMD;.BAT;.COM")
    .split(";")
    .filter(Boolean);
  return extensions.map((extension) => value + extension.toLowerCase());
}

function isExecutable(candidate, platform) {
  try {
    fs.accessSync(candidate, platform === "win32" ? fs.constants.F_OK : fs.constants.X_OK);
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

function isFile(candidate) {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

function findExecutable(base, env, platform) {
  return executableCandidates(base, platform, env).find((item) => isExecutable(item, platform));
}

function resolveToolchain(configuredPath, env = process.env, platform = process.platform) {
  const configured = configuredPath.trim();
  if (configured) {
    if (!path.isAbsolute(configured)) {
      return { error: "玄言工具链目录必须是绝对路径。" };
    }
    const bin = path.join(configured, "bin");
    const cli = findExecutable(path.join(bin, "xuanyan"), env, platform);
    const lsp = findExecutable(path.join(bin, "xuanyan-lsp"), env, platform);
    if (cli && lsp) {
      return { cli, lsp };
    }
    const missing = [!cli && "bin/xuanyan", !lsp && "bin/xuanyan-lsp"].filter(Boolean);
    return {
      cli,
      lsp,
      error: `玄言工具链目录缺少：${missing.join("、")}。`,
    };
  }

  const pathValue = env.PATH || env.Path || env.path || "";
  let cli;
  let lsp;
  for (const directory of pathValue.split(path.delimiter).filter(Boolean)) {
    if (!cli) {
      cli = findExecutable(path.join(directory, "xuanyan"), env, platform);
    }
    if (!lsp) {
      lsp = findExecutable(path.join(directory, "xuanyan-lsp"), env, platform);
    }
    if (cli && lsp) {
      return { cli, lsp };
    }
  }
  return {
    cli,
    lsp,
    error: "找不到完整玄言工具链。请把工具链 bin 目录加入 PATH，或设置 xuanyan.toolchain.path。",
  };
}

function findPackageRoot(startDirectory, boundaryDirectory) {
  let current = path.resolve(startDirectory);
  const boundary = boundaryDirectory ? path.resolve(boundaryDirectory) : path.parse(current).root;
  while (true) {
    if (isFile(path.join(current, "xuan.toml"))) {
      return current;
    }
    if (current === boundary) {
      return undefined;
    }
    const parent = path.dirname(current);
    if (parent === current || (boundaryDirectory && path.relative(boundary, parent).startsWith(".."))) {
      return undefined;
    }
    current = parent;
  }
}

function commandInvocation(command, target, platform = process.platform) {
  if (command === "测试" && target.kind !== "package") {
    return { error: "测试命令只接受包含 xuan.toml 的本地包。" };
  }
  if (command === "格式化") {
    return { args: ["格式化", "--write", target.path] };
  }
  if (command !== "构建") {
    return { args: [command, target.path] };
  }

  const suffix = platform === "win32" ? ".exe" : "";
  const output = path.join(target.cwd, "build", `${target.name}${suffix}`);
  return { args: ["构建", target.path, output], output };
}

function currentToolchain(vscode) {
  const configured = vscode.workspace
    .getConfiguration("xuanyan")
    .get("toolchain.path", "");
  return resolveToolchain(configured);
}

function activeTarget(vscode) {
  const editor = vscode.window.activeTextEditor;
  if (editor?.document.uri.scheme === "file" && editor.document.languageId === "xuanyan") {
    const file = editor.document.uri.fsPath;
    const folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
    const packageRoot = findPackageRoot(path.dirname(file), folder?.uri.fsPath);
    if (packageRoot) {
      return {
        kind: "package",
        path: packageRoot,
        cwd: packageRoot,
        name: path.basename(packageRoot),
        scope: folder,
        document: editor.document,
      };
    }
    return {
      kind: "file",
      path: file,
      cwd: path.dirname(file),
      name: path.basename(file, path.extname(file)),
      scope: folder,
      document: editor.document,
    };
  }

  for (const folder of vscode.workspace.workspaceFolders || []) {
    if (fs.existsSync(path.join(folder.uri.fsPath, "xuan.toml"))) {
      return {
        kind: "package",
        path: folder.uri.fsPath,
        cwd: folder.uri.fsPath,
        name: path.basename(folder.uri.fsPath),
        scope: folder,
      };
    }
  }
  return undefined;
}

async function runCommand(vscode, command) {
  if (!vscode.workspace.isTrusted) {
    vscode.window.showErrorMessage("受限工作区不执行玄言命令。请先信任当前工作区。");
    return undefined;
  }
  const toolchain = currentToolchain(vscode);
  if (!toolchain.cli) {
    vscode.window.showErrorMessage(toolchain.error);
    return undefined;
  }
  const target = activeTarget(vscode);
  if (!target) {
    vscode.window.showErrorMessage("请先打开一个 .xy 文件，或打开包含 xuan.toml 的工作区。");
    return undefined;
  }
  if (target.document?.isDirty && !(await target.document.save())) {
    vscode.window.showErrorMessage("当前玄言文件未能保存，命令已取消。");
    return undefined;
  }
  const invocation = commandInvocation(command, target);
  if (invocation.error) {
    vscode.window.showErrorMessage(invocation.error);
    return undefined;
  }
  if (invocation.output) {
    fs.mkdirSync(path.dirname(invocation.output), { recursive: true });
  }

  const execution = new vscode.ProcessExecution(toolchain.cli, invocation.args, {
    cwd: target.cwd,
  });
  const task = new vscode.Task(
    { type: "xuanyan", command },
    target.scope || vscode.TaskScope.Workspace,
    `玄言: ${command}`,
    "玄言",
    execution
  );
  task.presentationOptions = {
    reveal: vscode.TaskRevealKind.Always,
    panel: vscode.TaskPanelKind.Shared,
    clear: true,
    focus: command === "运行",
  };
  return vscode.tasks.executeTask(task);
}

async function activate(context) {
  const vscode = require("vscode");
  const { LanguageClient, TransportKind } = require("vscode-languageclient/node");
  for (const [id, command] of [
    ["xuanyan.check", "检查"],
    ["xuanyan.run", "运行"],
    ["xuanyan.build", "构建"],
    ["xuanyan.test", "测试"],
    ["xuanyan.format", "格式化"],
  ]) {
    context.subscriptions.push(
      vscode.commands.registerCommand(id, () => runCommand(vscode, command))
    );
  }

  const toolchain = currentToolchain(vscode);
  if (!toolchain.lsp) {
    vscode.window.showErrorMessage(toolchain.error);
    return;
  }

  client = new LanguageClient(
    "xuanyan",
    "玄言语言服务器",
    { command: toolchain.lsp, transport: TransportKind.stdio },
    { documentSelector: [{ scheme: "file", language: "xuanyan" }] }
  );
  context.subscriptions.push(client);
  try {
    await client.start();
  } catch (error) {
    vscode.window.showErrorMessage(`玄言语言服务器启动失败：${error.message || error}`);
    throw error;
  }
}

async function deactivate() {
  if (client) {
    await client.stop();
    client = undefined;
  }
}

module.exports = {
  activate,
  deactivate,
  commandInvocation,
  findPackageRoot,
  resolveToolchain,
};
