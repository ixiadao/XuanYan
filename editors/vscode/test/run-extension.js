"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { runTests } = require("@vscode/test-electron");

async function main() {
  const server = process.env.XUANYAN_TEST_LSP;
  if (!server || !path.isAbsolute(server) || !fs.existsSync(server)) {
    throw new Error("XUANYAN_TEST_LSP 必须指向已构建的 xuanyan-lsp 绝对路径");
  }
  const vscodeExecutablePath = process.env.VSCODE_EXECUTABLE_PATH;
  if (
    vscodeExecutablePath &&
    (!path.isAbsolute(vscodeExecutablePath) || !fs.existsSync(vscodeExecutablePath))
  ) {
    throw new Error("VSCODE_EXECUTABLE_PATH 必须指向 VS Code 可执行文件绝对路径");
  }

  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "xuanyan-vscode-workspace-"));
  const source = path.join(workspace, "main.xy");
  fs.writeFileSync(source, "函数 主函数( -> 整数 { 1 }\n", "utf8");
  process.env.XUANYAN_TEST_SOURCE = source;

  try {
    await runTests({
      version: "1.100.0",
      vscodeExecutablePath,
      extensionDevelopmentPath: path.resolve(__dirname, ".."),
      extensionTestsPath: path.resolve(__dirname, "suite.js"),
      launchArgs: [workspace, "--disable-extensions"],
    });
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
