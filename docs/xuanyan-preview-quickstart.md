# 玄言技术预览快速开始

玄言技术预览面向 x86_64 Windows 与 Linux。发布归档已经包含预编译 CLI、语言
服务器、标准库、HTTP 包、JSON 包和可直接运行的 `examples/` 示例；使用玄言
不需要安装 Rust、Cargo 或 rustc。

## 1. 下载与校验

从官方 GitHub Release 下载与系统匹配的归档、`SHA256SUMS` 和
`SHA256SUMS.sig`：

```text
xuanyan-v0.1.6-windows-x86_64.zip
xuanyan-v0.1.6-linux-x86_64.tar.gz
xuanyan-v0.1.6-vscode.vsix
```

发布签名使用独立 Ed25519 密钥。可信公钥文件是
[`security/xuanyan-release-signing-key.pub`](security/xuanyan-release-signing-key.pub)，
指纹为：

```text
SHA256:6O5UXW+dVTZyJOVJzHiKAsUGOTZF6hkhguoB+XqcCa4
```

先下载
[`security/xuanyan-release-allowed-signers`](security/xuanyan-release-allowed-signers)，
再验证 `SHA256SUMS` 的签名。

Windows PowerShell：

```powershell
$archive = ".\xuanyan-v0.1.6-windows-x86_64.zip"
cmd /c "ssh-keygen -Y verify -f xuanyan-release-allowed-signers -I xuanyan-release -n xuanyan-release -s SHA256SUMS.sig < SHA256SUMS"
$expected = ((Select-String -LiteralPath .\SHA256SUMS -SimpleMatch $archive.Substring(2)).Line -split "\s+")[0]
$actual = (Get-FileHash $archive -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -ne $expected) { throw "SHA-256 校验失败" }
Expand-Archive $archive -DestinationPath .
```

Linux：

```bash
ssh-keygen -Y verify \
  -f xuanyan-release-allowed-signers \
  -I xuanyan-release \
  -n xuanyan-release \
  -s SHA256SUMS.sig < SHA256SUMS
grep 'xuanyan-v0.1.6-linux-x86_64.tar.gz$' SHA256SUMS | sha256sum -c -
tar -xzf xuanyan-v0.1.6-linux-x86_64.tar.gz
```

## 2. 创建程序

在解压目录旁创建：

```text
工作目录/
  xuanyan-v0.1.6/
  hello/
    xuan.toml
    src/main.xy
```

`hello/xuan.toml`：

```toml
[package]
name = "hello"
entry = "src/main.xy"

[dependencies]
std = { path = "../xuanyan-v0.1.6/stdlib" }
```

`hello/src/main.xy`：

```xy
导入 std::文本连接;

公开 函数 主函数() -> 字符串 {
    文本连接("你好，", "玄言")
}
```

## 3. 检查、运行和构建

Windows PowerShell：

```powershell
cd .\hello
..\xuanyan-v0.1.6\bin\xuanyan.exe --version
..\xuanyan-v0.1.6\bin\xuanyan.exe 检查 .
..\xuanyan-v0.1.6\bin\xuanyan.exe 运行 .
..\xuanyan-v0.1.6\bin\xuanyan.exe 构建 . .\build\hello.exe
.\build\hello.exe
```

Linux：

```bash
cd hello
../xuanyan-v0.1.6/bin/xuanyan --version
../xuanyan-v0.1.6/bin/xuanyan 检查 .
../xuanyan-v0.1.6/bin/xuanyan 运行 .
../xuanyan-v0.1.6/bin/xuanyan 构建 . ./build/hello
./build/hello
```

命令应输出：

```text
你好，玄言
```

归档内的示例已经使用包内相对路径，可以直接运行。例如在解压目录中：

Windows PowerShell：

```powershell
"1`n2" | .\bin\xuanyan.exe 运行 .\examples\text-record
```

Linux：

```bash
printf "1\n2\n" | ./bin/xuanyan 运行 ./examples/text-record
```

示例应输出 `总和：3`。

## 4. VS Code 基础接入

公开仓库的 `editors/vscode` 提供 MIT 许可的基础扩展源码，可以生成可离线安装的
VSIX：

```powershell
cd editors/vscode
npm ci
npm test
npm run package
```

在 VS Code 的扩展视图中选择“从 VSIX 安装”，然后把 `xuanyan.lsp.path` 设置为
发布目录中 `bin/xuanyan-lsp[.exe]` 的绝对路径；也可以把该 `bin` 目录加入
`PATH`。扩展不会下载工具链。

## 5. 后续使用

公开命令只有：

```text
xuanyan 检查 <文件|包目录|xuan.toml>
xuanyan 运行 <文件|包目录|xuan.toml> [入口函数名] [-- <程序参数>...]
xuanyan 构建 <文件|包目录|xuan.toml> <输出文件> [入口函数名]
xuanyan 测试 <包目录|xuan.toml>
xuanyan 格式化 [--check|--write] <文件|目录|xuan.toml>
```

本地包依赖使用 `xuan.toml` 中的相对 `path`，当前不需要账户、远程包仓库或联网安装。
发布归档中的 HTTP 与 JSON 包分别位于 `packages/http` 和 `packages/json`；JSON 包
同时提供严格完整文本解析和基于事件列表的文本生成。语言服务器
`bin/xuanyan-lsp[.exe]` 通过标准 LSP `stdio` 通信，VS Code 扩展只负责启动该进程
和映射编辑器协议。

遇到问题时，先确认版本、平台、命令和最小复现，再按
[反馈指南](xuanyan-feedback.md) 提交。
