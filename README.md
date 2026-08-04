<p align="center">
  <img src="docs/assets/xuanyan-logo-full.svg" width="520" alt="玄言">
</p>

# 玄言

玄言是一门以中文作为第一设计语言的原生静态类型编程语言。它不是其他语言的中文
翻译层；语法、公开命名、诊断、标准库和工具链均按中文表达习惯独立设计。
当前编译器使用 Rust 实现，但用户程序由玄言自己的原生代码生成器编译，不依赖
Rust 工具链。随着语言能力成熟，玄言将具备使用自身实现编译器的可能，但自举不是
当前版本承诺。

当前开发主线已定型为 v0.2.1，最新已发布技术预览仍为 v0.2.0。
v0.2.0 提供 x86_64 Windows 与 Linux 离线工具链，并可在这两个开发宿主上为
Android arm64-v8a 与 HarmonyOS NEXT arm64-v8a 生成 AArch64 移动共享库。
使用时不需要账户、远程激活或远程包仓库。

## 最新已发布版本

v0.2.0 的 Windows、Linux 工具链和 VS Code 扩展均提供独立 SHA-256 校验文件，
并由同一份 Ed25519 签名清单覆盖。发布包不包含 Rust 源码、Cargo 工作区、PDB、
私钥或服务器配置。

## 下载

最新已发布版本：**v0.2.0**

- [Windows x86_64](https://github.com/ixiadao/XuanYan/releases/download/v0.2.0/xuanyan-v0.2.0-windows-x86_64.zip)
  · [SHA-256](https://github.com/ixiadao/XuanYan/releases/download/v0.2.0/xuanyan-v0.2.0-windows-x86_64.zip.sha256)
- [Linux x86_64](https://github.com/ixiadao/XuanYan/releases/download/v0.2.0/xuanyan-v0.2.0-linux-x86_64.tar.gz)
  · [SHA-256](https://github.com/ixiadao/XuanYan/releases/download/v0.2.0/xuanyan-v0.2.0-linux-x86_64.tar.gz.sha256)
- [VS Code 扩展](https://github.com/ixiadao/XuanYan/releases/download/v0.2.0/xuanyan-v0.2.0-vscode.vsix)
  · [SHA-256](https://github.com/ixiadao/XuanYan/releases/download/v0.2.0/xuanyan-v0.2.0-vscode.vsix.sha256)
- [签名校验清单](https://github.com/ixiadao/XuanYan/releases/download/v0.2.0/SHA256SUMS)
  · [Ed25519 签名](https://github.com/ixiadao/XuanYan/releases/download/v0.2.0/SHA256SUMS.sig)

下载、校验和第一个程序见
[技术预览快速开始](docs/xuanyan-preview-quickstart.md)。
发布公钥指纹为
`SHA256:6O5UXW+dVTZyJOVJzHiKAsUGOTZF6hkhguoB+XqcCa4`。

```xy
导入 std::文本连接;

公开 函数 主函数() -> 字符串 {
    文本连接("你好，", "玄言")
}
```

## 仓库内容

- `docs`：语言参考、架构说明、快速开始、已知限制和发布说明。
- `examples`：可以直接运行的玄言示例。
- `stdlib`：随技术预览提供的玄言标准库源码。
- `packages/http`：玄言 HTTP/1.1 服务端基础包，以及标准库 HTTPS 请求的薄转发和响应头查询。
- `packages/json`：有界严格 JSON 文本解析与生成包源码。
- `corelib`：编译器识别的公开玄言声明，不是编译器核心实现。
- `editors/vscode`：MIT 许可的 `.xy` 语法高亮与 LSP 客户端源码。
- `platforms/mobile-preview`：Android 与 HarmonyOS NEXT 共用的普通玄言四平台业务验收包。

## 开放边界

玄言编译器和语言服务器以预编译二进制发布，其 Rust 实现源码、Cargo 工作区和
内部构建配置不在本仓库公开，也不会通过 GitHub 分发。官方 Android JNI、
HarmonyOS NEXT Node-API、生命周期、网络和移动宿主适配源码同样保持私有。
本仓库中的 `.xy`、示例和文档可以依照
[玄言技术预览许可协议](LICENSE.md)使用、修改和分发。

## 文档与反馈

- [玄言 v0.1 语言参考](docs/xuanyan-v0.1-language-reference.md)
- [技术预览已知限制](docs/xuanyan-preview-known-limitations.md)
- [v0.2.1 候选说明](docs/releases/v0.2.1.md)
- [v0.2.0 发布说明](docs/releases/v0.2.0.md)
- [反馈指南](docs/xuanyan-feedback.md)
- [安全报告](.github/SECURITY.md)

缺陷和建议请使用本仓库的 Issue 表单。可能涉及安全的问题请使用 GitHub
`Security` 页面中的私密漏洞报告入口。
