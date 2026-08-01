# 贡献玄言

## 判断依据

修改前按以下顺序确定范围：

1. 当前明确需求。
2. [`docs/xuanyan-rolling-roadmap.md`](docs/xuanyan-rolling-roadmap.md)。
3. [`docs/xuanyan-v0.1-language-reference.md`](docs/xuanyan-v0.1-language-reference.md)
   和当前验收条件。
4. 当前实现与测试，只作为行为证据。

仓库的强制执行约束见 [`AGENTS.md`](AGENTS.md)。不要从旧提交、删除的样例或
历史测试或历史方案推导产品方向。

## 修改原则

- 一次完成一个可验证的架构结果，不按单个表达式、测试或后端分支拆任务。
- 先删除旧路径、重复实现和无效测试，再增加必要代码。
- 同一语义只保留一个事实来源；不增加兼容层、回退开关或临时双轨。
- 本地包服务只保留一份已解析 `LocalPackageGraph`；模块加载器直接消费包图，不复制
  依赖边或重新推断包关系。
- LSP 打开文件以规范路径保存全文并通过 `Compiler::check_sources` 分析，不从磁盘
  回退同一打开文档。
- CLI 和直接 artifact 的文件路径保持 `OsString` / `PathBuf`；只有命令名、入口
  函数名和玄言程序参数在边界处显式验证 UTF-8。
- 两个已拥有文本的普通组合优先使用普通标准库函数 `文本连接`；原地或循环构造
  使用固定 `文本追加` 宿主 ABI；不增加插值、格式语言或第二份拼接实现。
- 共享借用参数直接接收匹配的局部绑定或右值表达式，由语义分析创建调用期借用；
  可变借用参数只直接接收可变局部绑定。只有需要保存借用值、显式解引用或验证
  借用冲突时才写 `借用(...)` 或 `可变借用(...)`。
- 协议声明和协议实现的方法首参数只使用 `自身`、`借用 自身` 或
  `可变借用 自身`；Parser 归一为现有参数类型，下游不得增加接收者语法分支。
- 结构体字段访问允许结构体值或一层结构体借用作为根。语义分析判定可写性，
  HIR 将借用根归一为既有解引用 Place，MIR 和后端不增加专用路径。
- 结构体构造同名字段简写只由 Parser 归一为现有字段初始化表达式；下游不得增加
  简写专用节点或第二条生成路径。
- 完整结构体模式由语义分析确认字段全集，MIR 以单一解构语句整体消费源值并
  初始化字段局部值；枚举载荷中的完整结构体模式复用同一语句；不得通过放宽普通
  字段 `Move` 实现。
- 用户可运行的代表性程序放在 `examples`，原生验收直接复用同一包，不复制为
  测试夹具。
- 标准库 `tests/**/*.xy` 按基础值、文本、列表等稳定职责组织；包测试直接发现
  各模块中无参数的公开函数，不增加汇总入口、专用 runner 或重复标准库源码。
- 入口返回普通类型时保持现有标准输出行为；入口返回核心 `结果<T, E>` 时，由
  后端根据 MIR 返回类型和 LangItem 身份生成唯一的成功/失败进程出口，CLI 不重复
  判断类型或增加回退。
- 模块加载器以 `FileId -> PathBuf` 保存源码身份；导入、包测试发现和定义跳转不得
  用诊断显示文本重新定位文件。
- 产品执行只保留原生代码生成后端，不保留解释器、Rust 源码渲染、兼容层或回退路径。
- 原生后端只消费已验证 MIR、具体实例事实和统一宿主 ABI；不得恢复通用动态值、
  运行时协议选择、body 编号调用或通用位置解释器。
- 当前阶段只做 Windows、Linux、macOS 原生构建，不提前增加交叉编译配置。
- 按编译职责组织模块，不按函数机械拆文件。
- 实现或测试模块接近或超过 2000 行时审查职责与运行成本；只有职责确实混杂时才
  按职责拆分，不按行数机械切割。
- 不把 IDE、LSP、远程包、发布或文档搜索能力放入语言核心。

## 测试

日常修改先运行最小的相关测试，例如：

```powershell
cargo test -p xuanyan-core <测试名或模块路径>
```

提交完整架构结果前运行快速门禁：

```powershell
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace --lib --bins
cargo test -p xuanyan-core --test fast --test binary_file_host_abi --test field_visibility
cargo test -p xuanyan-lsp --test lsp
```

Windows PowerShell 5.1 的标准输入边界验收：

```powershell
.\tools\verify-powershell-stdin.ps1
```

修改后端、artifact、包系统、CLI 或准备工作包验收时，再运行原生行为门禁：

```powershell
cargo test -p xuanyan-core --lib native_backend::tests
cargo test -p xuanyan-core --test packages
cargo test -p xuanyan-cli --test cli
```

本机原生性能基线使用固定玄言程序和等价 `rustc -O` 参考：

```powershell
python tools/benchmark_native.py
```

脚本先构建 release CLI，但不把编译器自身构建计入结果；随后分别预热并交替测量玄言
CLI 与 `rustc -O` 生成固定程序的构建时间。双方 artifact 通过固定探针和当前输入
校验后，再预热并交替测量运行时间，同时记录产物大小。输出只用于同机比较，不作为
CI 或跨机器性能阈值。

HTTP 静态文件服务基线从预编译发布目录运行，不需要用户侧 Rust 工具链：

```powershell
python tools/package_local_release.py .\dist\xuanyan
python tools/benchmark_http_static_server.py .\dist\xuanyan
```

脚本在空 `PATH` 下用发布 CLI 构建一次固定服务器，然后直接计时两个外部客户端读取
1 KiB 文件；默认每个样本预热 20 个请求、计时 200 个请求并取 7 次中位数。结果同样
只用于当前机器，不作为 CI 或跨机器性能阈值。

该门禁当前验证具体实例与类型化原生生成、规范 artifact、最小标准库、基础值
文本化与解析、应用层文本连接、动态文本追加、文本分行、按非空子串分割、替换、
文本、列表与目录空值判断、查找、包含、截取与首尾判断、文本首尾空白去除、Unicode 大小写转换与拥有列表的首项、末项和指定项取出、程序参数、
标准输入、UTF-8 文本文件 I/O、原始字节文件读取、覆盖写入与追加写入、路径存在、类型查询与规范化、调用点自动借用、结构体字段赋值、入口结果进程
语义、用户示例、直接可执行文件和本地包工作流。Windows 与 Linux 执行全部原生
门禁；x86_64 macOS 执行 Mach-O 结构、基础整数与结果出口、布尔包测试和未覆盖
宿主 ABI 诊断的定向原生门禁。完整 Darwin 标准库和本地安装尚不计入 macOS 产品
承诺。性能工作包必须增加固定基准程序和可重复数据；早期性能可以较差。
不要启用历史测试入口，也不要通过放宽超时掩盖测试成本。

准备技术预览交付时，再从临时安装根和仓库外本地包验证 CLI、原生 artifact 与
LSP `stdio`。Windows 使用：

```powershell
python tools/verify-local-install.py
```

Linux 和 macOS 使用：

```sh
python3 tools/verify-local-install.py
```

验证当前宿主的免 Rust 本地发布目录时运行：

```powershell
python tools/verify-local-install.py --release
```

该门禁从干净源码副本组装 CLI、LSP 和 `stdlib`，删除源码、Cargo 缓存和构建目录，
再清空 `PATH` 并从仓库外执行现有 CLI、原生 artifact 与 LSP 验收。

## 提交

- 一个工作包最多使用一到两个整合提交。
- 提交必须对应完整删除结果或可验证的架构结果。
- 提交主题使用中文。
- 不提交生成的临时文件、构建产物或逐修复过程文档。
- 不改写或删除已经存在的提交历史。
