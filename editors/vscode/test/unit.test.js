"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  commandInvocation,
  findPackageRoot,
  resolveToolchain,
} = require("../extension");

function executable(root, name) {
  const file = path.join(root, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, "");
  if (process.platform !== "win32") {
    fs.chmodSync(file, 0o755);
  }
  return file;
}

function toolchain(root) {
  const suffix = process.platform === "win32" ? ".exe" : "";
  return {
    cli: executable(root, path.join("bin", `xuanyan${suffix}`)),
    lsp: executable(root, path.join("bin", `xuanyan-lsp${suffix}`)),
  };
}

test("uses an explicitly configured toolchain root", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "xuanyan-vscode-"));
  try {
    const expected = toolchain(root);
    assert.deepEqual(resolveToolchain(root), expected);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("finds the complete toolchain on PATH", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "xuanyan-vscode-"));
  try {
    const suffix = process.platform === "win32" ? ".exe" : "";
    const expected = {
      cli: executable(root, `xuanyan${suffix}`),
      lsp: executable(root, `xuanyan-lsp${suffix}`),
    };
    assert.deepEqual(resolveToolchain("", { PATH: root }), expected);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("rejects relative configured paths", () => {
  assert.match(resolveToolchain("xuanyan-toolchain").error, /绝对路径/);
});

test("finds only a package inside the workspace boundary", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "xuanyan-vscode-"));
  try {
    const packageRoot = path.join(root, "app");
    const nested = path.join(packageRoot, "src", "nested");
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(packageRoot, "xuan.toml"), "");
    assert.equal(findPackageRoot(nested, root), packageRoot);
    assert.equal(findPackageRoot(root, root), undefined);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("maps the five commands to the public CLI", () => {
  const target = {
    kind: "package",
    path: path.join("C:", "work", "app"),
    cwd: path.join("C:", "work", "app"),
    name: "app",
  };
  assert.deepEqual(commandInvocation("检查", target), {
    args: ["检查", target.path],
  });
  assert.deepEqual(commandInvocation("运行", target), {
    args: ["运行", target.path],
  });
  assert.deepEqual(commandInvocation("测试", target), {
    args: ["测试", target.path],
  });
  assert.deepEqual(commandInvocation("格式化", target), {
    args: ["格式化", "--write", target.path],
  });
  const build = commandInvocation("构建", target, "win32");
  assert.deepEqual(build.args, ["构建", target.path, build.output]);
  assert.equal(build.output, path.join(target.cwd, "build", "app.exe"));
  assert.match(
    commandInvocation("测试", { ...target, kind: "file" }).error,
    /xuan\.toml/
  );
});

test("declares the xy language and grammar", () => {
  const root = path.resolve(__dirname, "..");
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const grammar = JSON.parse(
    fs.readFileSync(path.join(root, "syntaxes", "xuanyan.tmLanguage.json"), "utf8")
  );
  assert.deepEqual(manifest.contributes.languages[0].extensions, [".xy"]);
  assert.equal(manifest.contributes.grammars[0].scopeName, "source.xuanyan");
  assert.equal(manifest.capabilities.untrustedWorkspaces.supported, "limited");
  assert.deepEqual(
    manifest.contributes.commands.map((command) => command.command),
    [
      "xuanyan.check",
      "xuanyan.run",
      "xuanyan.build",
      "xuanyan.test",
      "xuanyan.format",
    ]
  );
  assert.ok(manifest.contributes.configuration.properties["xuanyan.toolchain.path"]);
  assert.equal(manifest.contributes.configuration.properties["xuanyan.lsp.path"], undefined);
  assert.equal(
    manifest.contributes.configurationDefaults["[xuanyan]"][
      "editor.unicodeHighlight.nonBasicASCII"
    ],
    false
  );
  assert.equal(grammar.scopeName, "source.xuanyan");
});
