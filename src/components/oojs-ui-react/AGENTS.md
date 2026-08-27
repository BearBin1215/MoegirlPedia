# AGENTS.md

本包为 [OOUI](https://www.mediawiki.org/wiki/OOUI) 的 React 实现，依托 MediaWiki 站点自带样式，不自带 CSS。本文件为开发 Agent 的精简指引，完整方法论见 [docs/comparison-guide.md](./docs/comparison-guide.md)。

## 项目结构

```
oojs-ui-react/
├─ src/                      # 组件库源码（发布物）
│  ├─ widgets/               #   控件（Button/Dropdown/NumberInput…）
│  ├─ layouts/               #   布局（PanelLayout/BookletLayout…）
│  ├─ dialogs/               #   弹窗（Dialog/MessageDialog/WindowManager）
│  ├─ Element.tsx            #   基础元素
│  ├─ utils.ts               #   共享工具（类名生成/ChangeHandler等）
│  └─ index.ts               #   导出面
├─ tests/                    # 本地测试工程（pnpm start，端口8090）
│  ├─ components/ooui.ts     #   原版oojs-ui加载器（对照页基础设施）
│  ├─ pages/                 #   测试页；对照页命名 xxx-compare/
│  └─ config/router.ts       #   侧栏路由注册
├─ docs/comparison-guide.md  # 完整对照开发方法论
└─ TODO.md                   # 未实现/未对齐行为清单
```

## 核心约定

- **复杂组件开发必须与本地原版 `oojs-ui` 做行为对照**（源码比对 + 对照页实测），流程、加载机制、踩坑经验、验收清单详见 [docs/comparison-guide.md](./docs/comparison-guide.md)。
- 对照页放 `tests/pages/xxx-compare/` 并在 `tests/config/router.ts` 注册；原版库通过 `tests/components/ooui.ts` 的 `ensureOOUI()` 加载（不要自行打包引入原版库，勿把原版 dist 文件拷入仓库）。
- 对照后无法对齐的低频行为记入 `TODO.md`。

## 高频踩坑速查（详见指南）

- frame 过渡只做 `opacity + transform`，不要 `all`；高度测量在 `useLayoutEffect` 内钳 0 后进行，且仅在 `active && setup` 时执行。
- 键盘/滚轮需要 `preventDefault` 时使用原生监听（React 合成 wheel 为 passive）；注意 React 的 `KeyboardEvent` 类型与 DOM 同名类型的遮蔽问题。
- 输入类组件副作用需同时兼容非受控（`input` 事件）与受控（`value` 依赖）两条触发通道。
