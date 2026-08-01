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

function resolveServerPath(configuredPath, env = process.env, platform = process.platform) {
  const configured = configuredPath.trim();
  if (configured) {
    if (!path.isAbsolute(configured)) {
      return { error: "玄言语言服务器路径必须是绝对路径。" };
    }
    const candidate = executableCandidates(configured, platform, env).find((item) =>
      isExecutable(item, platform)
    );
    return candidate
      ? { path: candidate }
      : { error: `找不到玄言语言服务器：${configured}` };
  }

  const pathValue = env.PATH || env.Path || env.path || "";
  for (const directory of pathValue.split(path.delimiter).filter(Boolean)) {
    const base = path.join(directory, "xuanyan-lsp");
    const candidate = executableCandidates(base, platform, env).find((item) =>
      isExecutable(item, platform)
    );
    if (candidate) {
      return { path: candidate };
    }
  }
  return {
    error: "找不到 xuanyan-lsp。请把工具链 bin 目录加入 PATH，或设置 xuanyan.lsp.path。",
  };
}

async function activate(context) {
  const vscode = require("vscode");
  const { LanguageClient, TransportKind } = require("vscode-languageclient/node");
  const configuredPath = vscode.workspace.getConfiguration("xuanyan").get("lsp.path", "");
  const server = resolveServerPath(configuredPath);
  if (!server.path) {
    vscode.window.showErrorMessage(server.error);
    return;
  }

  client = new LanguageClient(
    "xuanyan",
    "玄言语言服务器",
    { command: server.path, transport: TransportKind.stdio },
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

module.exports = { activate, deactivate, resolveServerPath };
