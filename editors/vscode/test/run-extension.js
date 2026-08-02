"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { runTests } = require("@vscode/test-electron");

async function main() {
  const cli = process.env.XUANYAN_TEST_CLI;
  const server = process.env.XUANYAN_TEST_LSP;
  if (!cli || !path.isAbsolute(cli) || !fs.existsSync(cli)) {
    throw new Error("XUANYAN_TEST_CLI 必须指向已构建的 xuanyan 绝对路径");
  }
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
  const toolchain = fs.mkdtempSync(path.join(os.tmpdir(), "xuanyan-vscode-toolchain-"));
  const bin = path.join(toolchain, "bin");
  fs.mkdirSync(bin, { recursive: true });
  const suffix = process.platform === "win32" ? ".exe" : "";
  const installedCli = path.join(bin, `xuanyan${suffix}`);
  const installedLsp = path.join(bin, `xuanyan-lsp${suffix}`);
  fs.copyFileSync(cli, installedCli);
  fs.copyFileSync(server, installedLsp);
  if (process.platform !== "win32") {
    fs.chmodSync(installedCli, 0o755);
    fs.chmodSync(installedLsp, 0o755);
  }

  const diagnosticSource = path.join(workspace, "invalid.xy");
  fs.writeFileSync(diagnosticSource, "函数 主函数( -> 整数 { 1 }\n", "utf8");
  const packageRoot = path.join(workspace, "app");
  const packageSource = path.join(packageRoot, "src", "main.xy");
  fs.mkdirSync(path.dirname(packageSource), { recursive: true });
  fs.mkdirSync(path.join(packageRoot, "tests"), { recursive: true });
  fs.writeFileSync(
    path.join(packageRoot, "xuan.toml"),
    '[package]\nname = "vscode-workflow"\nentry = "src/main.xy"\n',
    "utf8"
  );
  fs.writeFileSync(packageSource, "公开 函数 主函数() -> 整数 { 42 }\n", "utf8");
  fs.writeFileSync(
    path.join(packageRoot, "tests", "smoke.xy"),
    "导入 src::main::主函数;\n\n公开 函数 VSCode命令可运行() -> 布尔 {\n    主函数() == 42\n}\n",
    "utf8"
  );
  process.env.XUANYAN_TEST_TOOLCHAIN = toolchain;
  process.env.XUANYAN_TEST_SOURCE = diagnosticSource;
  process.env.XUANYAN_TEST_PACKAGE_SOURCE = packageSource;
  process.env.XUANYAN_TEST_ARTIFACT = path.join(packageRoot, "build", `app${suffix}`);

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
    fs.rmSync(toolchain, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
