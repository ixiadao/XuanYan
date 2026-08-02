"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vscode = require("vscode");

async function waitForDiagnostic(uri) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const diagnostics = vscode.languages.getDiagnostics(uri);
    if (diagnostics.length) {
      return diagnostics;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return [];
}

async function runTaskCommand(id, command) {
  let timer;
  let subscription;
  const finished = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      subscription?.dispose();
      reject(new Error(`${command} 未在 60 秒内结束`));
    }, 60000);
    subscription = vscode.tasks.onDidEndTaskProcess((event) => {
      if (event.execution.task.definition.command !== command) {
        return;
      }
      clearTimeout(timer);
      subscription.dispose();
      resolve(event.exitCode);
    });
  });
  const execution = await vscode.commands.executeCommand(`xuanyan.${id}`);
  assert.ok(execution, `${command} 未启动玄言任务`);
  assert.equal(await finished, 0, `${command} 执行失败`);
}

async function run() {
  const toolchain = process.env.XUANYAN_TEST_TOOLCHAIN;
  const source = process.env.XUANYAN_TEST_SOURCE;
  await vscode.workspace
    .getConfiguration("xuanyan")
    .update("toolchain.path", toolchain, vscode.ConfigurationTarget.Global);

  const document = await vscode.workspace.openTextDocument(source);
  await vscode.window.showTextDocument(document);
  assert.equal(document.languageId, "xuanyan");
  assert.equal(
    vscode.workspace
      .getConfiguration("editor", {
        uri: document.uri,
        languageId: document.languageId,
      })
      .get("unicodeHighlight.nonBasicASCII"),
    false
  );
  const extension = vscode.extensions.getExtension("ixiadao.xuanyan");
  assert.ok(extension, "玄言扩展未加载");
  await extension.activate();

  const diagnostics = await waitForDiagnostic(document.uri);
  assert.ok(diagnostics.length > 0, "玄言 LSP 未返回诊断");
  assert.equal(diagnostics[0].source, "xuanyan");

  const commands = await vscode.commands.getCommands(true);
  for (const command of ["check", "run", "build", "test", "format"]) {
    assert.ok(commands.includes(`xuanyan.${command}`), `未注册 xuanyan.${command}`);
  }

  const packageDocument = await vscode.workspace.openTextDocument(
    process.env.XUANYAN_TEST_PACKAGE_SOURCE
  );
  await vscode.window.showTextDocument(packageDocument);
  for (const [id, command] of [
    ["format", "格式化"],
    ["check", "检查"],
    ["run", "运行"],
    ["test", "测试"],
    ["build", "构建"],
  ]) {
    await runTaskCommand(id, command);
  }
  assert.ok(fs.existsSync(process.env.XUANYAN_TEST_ARTIFACT), "构建命令未生成原生产物");
}

module.exports = { run };
