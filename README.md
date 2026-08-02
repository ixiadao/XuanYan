<p align="center">
  <img src="docs/assets/xuanyan-logo-full.svg" width="520" alt="玄言">
</p>

# 玄言

玄言是一门以中文作为第一设计语言的原生静态类型编程语言。它不是其他语言的中文
翻译层；语法、公开命名、诊断、标准库和工具链均按中文表达习惯独立设计。
当前编译器使用 Rust 实现，但用户程序由玄言自己的原生代码生成器编译，不依赖
Rust 工具链。随着语言能力成熟，玄言将具备使用自身实现编译器的可能，但自举不是
当前版本承诺。

当前技术预览面向 x86_64 Windows 与 Linux，使用时不需要账户、远程激活或远程
包仓库。v0.1.6 提供阻塞式 HTTPS GET、严格 JSON 文本包、按职责分域的标准库源码
和 VS Code 基础扩展。

## 开发状态

当前可下载并经过签名的版本仍是 v0.1.6。v0.2.0 前的下一阶段能力已经在私有核心
仓库完成，正在进入公开版本准备。为避免源码接口与已发布工具链不匹配，本仓库的
标准库、普通包、示例和编辑器扩展暂时继续与 v0.1.6 保持一致；下一版会在免源码
发布门禁通过后，同步公开组件和签名二进制。

## 下载

当前版本：**v0.1.6**

- [Windows x86_64](https://github.com/ixiadao/XuanYan/releases/download/v0.1.6/xuanyan-v0.1.6-windows-x86_64.zip)
  · [SHA-256](https://github.com/ixiadao/XuanYan/releases/download/v0.1.6/xuanyan-v0.1.6-windows-x86_64.zip.sha256)
- [Linux x86_64](https://github.com/ixiadao/XuanYan/releases/download/v0.1.6/xuanyan-v0.1.6-linux-x86_64.tar.gz)
  · [SHA-256](https://github.com/ixiadao/XuanYan/releases/download/v0.1.6/xuanyan-v0.1.6-linux-x86_64.tar.gz.sha256)
- [VS Code 扩展](https://github.com/ixiadao/XuanYan/releases/download/v0.1.6/xuanyan-v0.1.6-vscode.vsix)
  · [SHA-256](https://github.com/ixiadao/XuanYan/releases/download/v0.1.6/xuanyan-v0.1.6-vscode.vsix.sha256)
- [签名校验清单](https://github.com/ixiadao/XuanYan/releases/download/v0.1.6/SHA256SUMS)
  · [Ed25519 签名](https://github.com/ixiadao/XuanYan/releases/download/v0.1.6/SHA256SUMS.sig)

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
- `packages/http`：玄言 HTTP/1.1 服务端基础包源码。
- `packages/json`：有界严格 JSON 文本解析与生成包源码。
- `corelib`：编译器识别的公开玄言声明，不是编译器核心实现。
- `editors/vscode`：MIT 许可的 `.xy` 语法高亮与 LSP 客户端源码。

## 开放边界

玄言编译器和语言服务器以预编译二进制发布，其 Rust 实现源码、Cargo 工作区和
内部构建配置不在本仓库公开，也不会通过 GitHub 分发。
本仓库中的 `.xy`、示例和文档可以依照
[玄言技术预览许可协议](LICENSE.md)使用、修改和分发。

## 文档与反馈

- [玄言 v0.1 语言参考](docs/xuanyan-v0.1-language-reference.md)
- [技术预览已知限制](docs/xuanyan-preview-known-limitations.md)
- [v0.1.6 发布说明](docs/releases/v0.1.6.md)
- [反馈指南](docs/xuanyan-feedback.md)
- [安全报告](.github/SECURITY.md)

缺陷和建议请使用本仓库的 Issue 表单。可能涉及安全的问题请使用 GitHub
`Security` 页面中的私密漏洞报告入口。
