"use strict";

const assert = require("node:assert/strict");
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

async function run() {
  const server = process.env.XUANYAN_TEST_LSP;
  const source = process.env.XUANYAN_TEST_SOURCE;
  await vscode.workspace
    .getConfiguration("xuanyan")
    .update("lsp.path", server, vscode.ConfigurationTarget.Global);

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
}

module.exports = { run };
