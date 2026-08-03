# 玄言技术预览快速开始

玄言技术预览提供 x86_64 Windows 与 Linux 工具链归档。归档已经包含预编译 CLI、
语言服务器、标准库、HTTP 包、JSON 包和可直接运行的 `examples/` 示例；使用玄言
不需要安装 Rust、Cargo 或 rustc。工具链还可为 Android arm64-v8a 与 HarmonyOS
NEXT arm64-v8a 生成移动共享库。

## 1. 下载与校验

从官方 GitHub Release 下载与系统匹配的归档、`SHA256SUMS` 和
`SHA256SUMS.sig`：

```text
xuanyan-v0.2.0-windows-x86_64.zip
xuanyan-v0.2.0-linux-x86_64.tar.gz
xuanyan-v0.2.0-vscode.vsix
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
$archive = ".\xuanyan-v0.2.0-windows-x86_64.zip"
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
grep 'xuanyan-v0.2.0-linux-x86_64.tar.gz$' SHA256SUMS | sha256sum -c -
tar -xzf xuanyan-v0.2.0-linux-x86_64.tar.gz
```

解压后可以直接从归档目录使用，也可以执行每用户离线安装。Windows：

```powershell
.\xuanyan-v0.2.0\install.ps1
```

Linux：

```bash
./xuanyan-v0.2.0/install.sh
```

安装不需要管理员权限或联网。脚本会输出 `std`、`http` 和 `json` 三条可直接写入
`xuan.toml` 的绝对路径；卸载使用同目录中的 `uninstall.ps1` 或 `uninstall.sh`。

## 2. 创建程序

在解压目录旁创建：

```text
工作目录/
  xuanyan-v0.2.0/
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
std = { path = "../xuanyan-v0.2.0/stdlib" }
```

如果已经执行离线安装，也可以把上面的相对路径替换为安装脚本输出的 `std` 绝对
路径。绝对路径适合跨盘引用，但清单会与当前机器的安装位置绑定。

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
..\xuanyan-v0.2.0\bin\xuanyan.exe --version
..\xuanyan-v0.2.0\bin\xuanyan.exe 检查 .
..\xuanyan-v0.2.0\bin\xuanyan.exe 运行 .
..\xuanyan-v0.2.0\bin\xuanyan.exe 构建 . .\build\hello.exe
.\build\hello.exe
```

Linux：

```bash
cd hello
../xuanyan-v0.2.0/bin/xuanyan --version
../xuanyan-v0.2.0/bin/xuanyan 检查 .
../xuanyan-v0.2.0/bin/xuanyan 运行 .
../xuanyan-v0.2.0/bin/xuanyan 构建 . ./build/hello
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

## 4. 构建移动共享库

移动技术预览只接受两个固定平台名称，并统一生成 AArch64 ELF 共享库：

```powershell
xuanyan 构建 --平台 android-arm64-v8a . .\libxuanyan.so
xuanyan 构建 --平台 harmonyos-next-arm64-v8a . .\libxuanyan.so
```

公开仓库只提供普通 `.xy` 移动验收包，不公开官方 JNI、Node-API、生命周期、网络
和移动宿主适配源码，也不提供商店签名 APK 或 HAP。上述平台壳继续在私有源码树中
使用对应 SDK、签名配置和设备完成真机验收。

## 5. VS Code 基础接入

公开仓库的 `editors/vscode` 提供 MIT 许可的基础扩展源码，可以生成可离线安装的
VSIX：

```powershell
cd editors/vscode
npm ci
npm test
npm run package
```

在 VS Code 的扩展视图中选择“从 VSIX 安装”，然后把
`xuanyan.toolchain.path` 设置为工具链解压目录的绝对路径；也可以把该目录下的
`bin` 加入 `PATH`。扩展不会下载工具链。

命令面板和玄言文件右键菜单提供检查、运行、构建、测试和格式化。活动文件位于
本地包中时，命令作用于最近的 `xuan.toml` 所在目录；否则作用于当前 `.xy` 文件。
测试只接受本地包，构建产物写入目标目录的 `build` 子目录。受限工作区不执行
这些命令。

## 6. 后续使用

公开命令只有：

```text
xuanyan 检查 <文件|包目录|xuan.toml>
xuanyan 运行 <文件|包目录|xuan.toml> [入口函数名] [-- <程序参数>...]
xuanyan 构建 [--平台 <android-arm64-v8a|harmonyos-next-arm64-v8a>] <文件|包目录|xuan.toml> <输出文件> [入口函数名]
xuanyan 测试 <包目录|xuan.toml>
xuanyan 格式化 [--check|--write] <文件|目录|xuan.toml>
```

本地包依赖使用 `xuan.toml` 中的相对路径或当前平台完整绝对路径；当前不需要账户、
远程包仓库或联网安装。
发布归档中的 HTTP 与 JSON 包分别位于 `packages/http` 和 `packages/json`；JSON 包
同时提供严格完整文本解析和基于事件列表的文本生成。语言服务器
`bin/xuanyan-lsp[.exe]` 通过标准 LSP `stdio` 通信，VS Code 扩展只负责映射
编辑器协议和调用同一工具链中的公开 CLI。

遇到问题时，先确认版本、平台、命令和最小复现，再按
[反馈指南](xuanyan-feedback.md) 提交。
