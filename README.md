<p align="center">
  <img src="docs/assets/xuanyan-logo-full.svg" width="520" alt="玄言">
</p>

# 玄言

玄言是一门使用中文语法、中文类型名和中文诊断的静态类型编程语言。
当前技术预览面向 x86_64 Windows 与 Linux，使用时不需要安装 Rust、Cargo 或
rustc，也不需要账户、远程激活或远程包仓库。

## 下载

当前版本：**v0.1.3**

- [Windows x86_64](https://github.com/ixiadao/XuanYan/releases/download/v0.1.3/xuanyan-v0.1.3-windows-x86_64.zip)
  · [SHA-256](https://github.com/ixiadao/XuanYan/releases/download/v0.1.3/xuanyan-v0.1.3-windows-x86_64.zip.sha256)
- [Linux x86_64](https://github.com/ixiadao/XuanYan/releases/download/v0.1.3/xuanyan-v0.1.3-linux-x86_64.tar.gz)
  · [SHA-256](https://github.com/ixiadao/XuanYan/releases/download/v0.1.3/xuanyan-v0.1.3-linux-x86_64.tar.gz.sha256)

下载、校验和第一个程序见
[技术预览快速开始](docs/xuanyan-preview-quickstart.md)。

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
- `packages/http`：玄言 HTTP/1.1 基础包源码。
- `corelib`：编译器识别的核心玄言声明。

## 开放边界

玄言编译器和语言服务器以预编译二进制发布，其实现源码不在本仓库公开。
本仓库中的 `.xy`、示例和文档可以依照
[玄言技术预览许可协议](LICENSE.md)使用、修改和分发。

## 文档与反馈

- [玄言 v0.1 语言参考](docs/xuanyan-v0.1-language-reference.md)
- [技术预览已知限制](docs/xuanyan-preview-known-limitations.md)
- [v0.1.3 发布说明](docs/releases/v0.1.3.md)
- [反馈指南](docs/xuanyan-feedback.md)
- [安全报告](.github/SECURITY.md)

缺陷和建议请使用本仓库的 Issue 表单。可能涉及安全的问题请使用 GitHub
`Security` 页面中的私密漏洞报告入口。
