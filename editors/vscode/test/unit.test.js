"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { resolveServerPath } = require("../extension");

function executable(root, name) {
  const file = path.join(root, name);
  fs.writeFileSync(file, "");
  if (process.platform !== "win32") {
    fs.chmodSync(file, 0o755);
  }
  return file;
}

test("uses an explicitly configured absolute server path", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "xuanyan-vscode-"));
  try {
    const name = process.platform === "win32" ? "xuanyan-lsp.exe" : "xuanyan-lsp";
    const server = executable(root, name);
    assert.deepEqual(resolveServerPath(server), { path: server });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("finds xuanyan-lsp on PATH", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "xuanyan-vscode-"));
  try {
    const name = process.platform === "win32" ? "xuanyan-lsp.exe" : "xuanyan-lsp";
    const server = executable(root, name);
    assert.deepEqual(resolveServerPath("", { PATH: root }), { path: server });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("rejects relative configured paths", () => {
  assert.match(resolveServerPath("bin/xuanyan-lsp").error, /绝对路径/);
});

test("declares the xy language and grammar", () => {
  const root = path.resolve(__dirname, "..");
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const grammar = JSON.parse(
    fs.readFileSync(path.join(root, "syntaxes", "xuanyan.tmLanguage.json"), "utf8")
  );
  assert.deepEqual(manifest.contributes.languages[0].extensions, [".xy"]);
  assert.equal(manifest.contributes.grammars[0].scopeName, "source.xuanyan");
  assert.equal(manifest.capabilities.untrustedWorkspaces.supported, true);
  assert.equal(
    manifest.contributes.configurationDefaults["[xuanyan]"][
      "editor.unicodeHighlight.nonBasicASCII"
    ],
    false
  );
  assert.equal(grammar.scopeName, "source.xuanyan");
});
