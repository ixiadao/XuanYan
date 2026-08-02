# 玄言 VS Code 扩展

这个扩展提供 `.xy` 文件识别、基础语法高亮，并通过现有
`xuanyan-lsp` 提供诊断、跳转、悬停、签名帮助、补全、引用、重命名、格式化、
语义令牌和符号导航。命令面板和玄言文件右键菜单提供检查、运行、构建、测试和
格式化五个命令。

## 安装

在 VS Code 的扩展视图中选择“从 VSIX 安装”，打开
`xuanyan-vscode.vsix`。

扩展不会下载工具链。请先解压玄言技术预览，并采用以下一种方式配置工具链：

1. 把发布目录中的 `bin` 加入 `PATH`。
2. 在设置中把 `xuanyan.toolchain.path` 指向工具链解压目录的绝对路径；该目录
   下应存在 `bin/xuanyan[.exe]` 和 `bin/xuanyan-lsp[.exe]`。

修改工具链路径后重新加载 VS Code 窗口。

活动 `.xy` 文件位于本地包中时，五个命令作用于最近的 `xuan.toml` 所在目录；
否则作用于当前文件。测试只接受本地包。构建产物写入目标目录的 `build` 子目录。
受限工作区不执行这些命令。

## 本地验证

```powershell
npm ci
npm test
npm run package
python ..\..\tools\verify_vscode_extension.py .\dist\xuanyan-vscode.vsix
```

扩展本身不包含编译器或语言服务器源码，也不提供工具链自动下载、远程包、调试器
或遥测。
