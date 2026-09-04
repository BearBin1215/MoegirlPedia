# AGENTS.md

本仓库用于编写萌娘百科用户小工具（gadgets）。源码经构建后输出到 `dist/`，站内通过 `mw.loader.load` 引用。

## 协作约定

- 面向中文用户，注释、对话均使用中文
- 当用户要求较为宽泛、有多套方案时，列出方案让用户选择

## 技术栈

- **语言**：TypeScript（含少量存量JS）、CSS
- **框架**：JQuery / React / Vue 3
  - JQuery 用于轻量工具
  - React 用于复杂度较高的工具，在本仓库使用 preact 兼容层控制打包体积
  - Vue 通常和 Codex 一起使用，见 [Example-Vue](src/gadgets/Example-Vue/index.ts)
- **构建**：Rspack

## 约束与运行注意事项

本仓库运行于萌娘百科（MediaWiki站点），非完全独立的前端网页工程：

- MediaWiki网页有提供全局变量和函数，可以获取当前页面信息、用户信息、正在执行的操作，需要或不确定时让用户提供
- 避免引入打包后体积过大的库
- 萌娘百科有两个皮肤：`vector-2022`和`moeskin`（通称萌皮），页面中的元素可能有差异。当涉及添加元素到指定位置等场景时可能需要区分，应让用户提供对应的位置元素

## 常用命令

```bash
# 开发模式 watch 构建
pnpm start

# 打包（无参数则全量打包）
pnpm build [工具名...]

# 类型检查
pnpm typecheck

# 检查并修复 linter 问题
pnpm lint:fix
```

## 文件结构

```
├── src/
│   ├── gadgets/             # 小工具，每个目录一个工具，以 index.* 为入口
│   │   └── ...              # 构建产物对应 dist/gadgets/<工具名>.min.js
│   ├── oddments/            # 零散单文件小工具
│   ├── components/          # 跨工具共享组件（Loger、MediaWiki、ModIcon 等）
│   │   └── oojs-ui-react/   # 独立 workspace 子包：oojs-ui 的 React 复刻组件库（含自己的 AGENTS.md）
│   ├── types/               # 全局类型声明（MediaWiki API、模块导入等）
│   └── utils/               # 共享工具函数（api、dom、file、string 等）
├── scripts/                 # 构建与部署脚本（build.ts、Synchronize.ts）
├── dist/                    # 构建产物（发布用，勿手改）
├── img/                     # README 演示图
└── .github/                 # CI 等仓库配置
```

## 代码规范

- 新工具一律使用TS，不使用JS
- 涉及萌百网络请求响应，使用`@types/api`中的类型定义响应，缺失时需要补上
- 避免并发网络请求
- React编写的工具优先使用`oojs-ui-react`提供的组件，除非对应需要的组件不完善或另有要求
- 所有函数均要有对应的顶部jsdoc注释，复杂逻辑需要有对应的行注释
