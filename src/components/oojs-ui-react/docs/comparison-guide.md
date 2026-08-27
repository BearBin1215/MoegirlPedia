# oojs-ui-react 对照开发指南（原版 oojs-ui vs React 版）

本组件库以 React 重新实现 [OOUI](https://www.mediawiki.org/wiki/OOUI)，依托 MediaWiki 站点自带样式，不自带 CSS。开发复杂组件时，必须与本地安装的原版 `oojs-ui` 做行为对照，确保交互语义一致。

## 对照开发流程

新组件（尤其是有交互的）按以下步骤开发：

1. **精读原版源码**，整理行为清单。原版未压缩源码在
   `node_modules/.pnpm/oojs-ui@<版本>/node_modules/oojs-ui/dist/oojs-ui.js`（合并版，含 core/widgets/windows/主题类）。
   定位技巧：grep `OO.ui.<类名>.prototype.<方法> = function` 逐个方法读。
2. **列出差异清单**（逐项对照构造函数 config、事件绑定、键盘处理、a11y 属性、边界值），修复 React 版。
3. **建对照页**（见下文），与原版并排实测。
4. **行为验收**：肉眼对比动画观感 + 自动化脚本验证数据。
5. 无法对齐的低频行为记录到 `TODO.md`，并在对照页说明。

## 原版库加载机制（对照页基础设施）

- 原版库依赖全局 `jQuery`/`OO`，其 dist 是 IIFE（`this` 挂载），不能直接打包 import。
- `rspack.config.js` 中有 `asset/resource` 规则，把 node_modules 内原版 dist 文件按 **URL** 引入（文件不入库、随依赖升级）：
  `import oouiUrl from 'oojs-ui/dist/oojs-ui.js'` → 得到 URL 字符串。
- `tests/components/ooui.ts` 提供：
  - `ensureOOUI()`：按序注入 `jquery → oojs → oojs-ui → 主题` 四个脚本到全局，返回 OO 命名空间。
    - 脚本注入必须 `script.async = false`（动态脚本默认按**下载完成顺序**执行，大文件会乱序）；
    - 每个脚本带 id 去重（防 HMR/StrictMode 双跑导致 `customElements.define` 重复注册）；
    - 模块级 promise 单例（StrictMode effect 双调用只注入一次）。
  - `unwrapJQuery($el)`：jQuery 对象 → 真实 DOM 节点（appendChild 用）。
  - `compareLayoutStyle`：左右并排布局样式。
- 对照页命名约定：`tests/pages/xxx-compare/index.tsx`，并在 `tests/config/router.ts` 注册。

## 关键经验（踩坑沉淀）

### 动画与测量（Dialog 调试沉淀）

- **frame 的 transition 不能用 `all`**：height 参与过渡会产生"从矮到高"观感，且过渡期间 body 溢出出现滚动条。原版动画只有 `transform: scale(0.5→1) + opacity`（纯视觉，不影响布局）。JSX 内联写 `transition: 'opacity 0.25s, transform 0.25s'`。
- **高度测量必须在 paint 前完成**（`useLayoutEffect`），且**测量前瞬时钳制 `height: 0` 再设最终值**。若 transition 含 height，钳 0 后布局仍按过渡渐变，`scrollHeight` 会被上一帧盒子高度垫高，导致每次开关高度递增（每轮多计一个 foot 高度）。
- **测量加门禁**：仅在 `active && setup`（布局稳定期）测量；动画中/关闭中/resize 引发的测量会被过渡态污染。
- **生命周期分拍对齐原版**：
  - 打开：`active`（dialog 展开，frame 以 scale(0.5)+透明可见）→ 60ms `setup`（同帧设最终高度 + scale→1 + 淡入）→ 120ms `ready`（聚焦）。
  - 关闭：hold（**立即**移除 setup，播放 250ms 缩小淡出）→ teardown（移除 active 隐藏）。若 setup 残留到隐藏，观感是"直接消失"。
- **不要把会动画的属性写死在 JSX style**：React 每次渲染都会重置 DOM style，命令式设置的值会被抹掉（高度重置是多个诡异 bug 的根源）。

### 事件与键盘

- **React 合成 `wheel` 事件是 passive 的**，`preventDefault()` 无效。需要阻止默认行为的滚轮处理必须用原生监听：`input.addEventListener('wheel', fn, { passive: false })`。
- `import { type KeyboardEvent } from 'react'` 会遮蔽 DOM 的 `KeyboardEvent`，导致 `document.addEventListener('keydown', ...)` 类型报错。重命名：`type KeyboardEvent as ReactKeyboardEvent`。
- **非受控用法兼容**：类输入组件不能只依赖 `value` prop 变化触发副作用（非受控时 value 恒 undefined，effect 只跑一次）。用 `input` 事件监听（键入即时）+ `value` 依赖（程序化赋值/受控回流）双通道。
- 键盘交互对齐要点：Enter/Space 开合、↑↓ 循环移动高亮（跳过禁用项）、Enter 选中高亮、Home/End、ESC 关闭；a11y 属性：`role=combobox`、`aria-haspopup`、`aria-expanded`、`aria-autocomplete`、`aria-selected`/`aria-checked`（写实际布尔值，不要写死 false）。
- 聚焦顺序对齐原版 `Dialog.focus()`：ready 后先聚焦 content，再交由子类聚焦 primary action（`onReady` 回调）。

### 数值输入

- 测量/钳制逻辑对齐原版 `adjustValue`：空值按 0 起步、钳制 `[min,max]`、按 `step` 取整；键入则保留原样不钳制（原版 `validateNumber` 只校验不改写）、清空保持空串。
- `maxRows`/`buttonStep`/`pageStep` 等默认值公式对齐原版：`maxRows || max(2×rows, 10)`、`buttonStep || step`、`pageStep || 10×buttonStep`。

## 浏览器自动化验证注意（trae 浏览器桥限制）

- `browser_evaluate` 的脚本**不能包含 IIFE/`function` 关键字**（静默返回 undefined），用语句序列 + 箭头函数 + 末尾表达式：`var el=...;JSON.stringify(...)`。
- `press_key` 的修饰键（Ctrl/Alt）不生效，`click` 不设置 DOM focus。需要修饰键或精确焦点时，向目标元素 `dispatchEvent(new KeyboardEvent('keydown', {key, ctrlKey, bubbles: true}))`（React 合成事件靠冒泡捕获 ✓）。
- 桥单次往返 >250ms，无法抓动画中间帧；时序验证用 `MutationObserver` 记录 class 变更时间线。
- 页面上有多个同类控件时，`querySelector` 全局查询会串结果（如侧栏的语言下拉、原版残留的选中高亮），读取时限定容器或按索引取。
- 控制台错误用 `console_messages` 的 `[error]` 段定位；注意 dev-server 自身的 URL 含 "errors=true" 会干扰过滤。

## 验收清单

- [ ] `pnpm exec tsc --noEmit` 零错误
- [ ] 对照页并排：肉眼对比打开/关闭动画、焦点行为、键盘全流程
- [ ] 原版有而 React 版缺的行为：要么补齐，要么记入 TODO.md
- [ ] a11y 属性（aria-*、role）与原版 DOM 一致
- [ ] 非受控 + 受控两种用法都验证
