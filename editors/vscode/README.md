# 玄言 VS Code 扩展

这个扩展提供 `.xy` 文件识别、基础语法高亮，并通过现有
`xuanyan-lsp` 提供诊断、跳转、悬停、签名帮助、补全、引用、重命名、格式化、
语义令牌和符号导航。

## 安装

在 VS Code 的扩展视图中选择“从 VSIX 安装”，打开
`xuanyan-vscode.vsix`。

扩展不会下载工具链。请先解压玄言技术预览，并采用以下一种方式配置语言服务器：

1. 把发布目录中的 `bin` 加入 `PATH`。
2. 在设置中把 `xuanyan.lsp.path` 指向
   `xuanyan-lsp.exe`（Windows）或 `xuanyan-lsp`（Linux）的绝对路径。

修改语言服务器路径后重新加载 VS Code 窗口。

## 本地验证

```powershell
npm ci
npm test
npm run package
python ..\..\tools\verify_vscode_extension.py .\dist\xuanyan-vscode.vsix
```

扩展本身不包含编译器或语言服务器源码，也不提供工具链自动下载、远程包、调试器
或遥测。
