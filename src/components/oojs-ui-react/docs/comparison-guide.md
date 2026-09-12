# oojs-ui-react 对照开发指南（原版 oojs-ui vs React 版）

本组件库以 React 重新实现 [OOUI](https://www.mediawiki.org/wiki/OOUI)，依托 MediaWiki 站点自带样式，不自带 CSS。开发复杂组件时，必须与本地安装的原版 `oojs-ui` 做行为对照，确保交互语义一致。

## 对照开发流程

新组件（尤其是有交互的）按以下步骤开发：

1. **精读原版源码**，整理行为清单。原版未压缩源码在
   `node_modules/.pnpm/oojs-ui@<版本>/node_modules/oojs-ui/dist/oojs-ui.js`（合并版，含 core/widgets/windows/主题类）。
   定位技巧：grep `OO.ui.<类名>.prototype.<方法> = function` 逐个方法读。
2. **列出差异清单**（逐项对照构造函数 config、事件绑定、键盘处理、a11y 属性、边界值），修复/实现 React 版。
3. **建对照页**（见下文），与原版并排实测。
4. **行为验收**：肉眼对比动画观感 + 自动化脚本验证数据。
5. 无法对齐的低频行为记录到 `TODO.md`，并在对照页说明。

## 原版库加载机制（对照页基础设施）

- 原版库依赖全局 `jQuery`/`OO`，其 dist 是 IIFE（`this` 挂载），不能直接打包 import。
- `vite.config.ts`（playground 目录）中经别名把 `oojs-ui-react` 指向 `src/`；原版 dist 文件在页面代码里以 `?url` 引入（文件不入库、随依赖升级）：
  `import oouiUrl from 'oojs-ui/dist/oojs-ui.js?url'` → 得到 URL 字符串。
- `playground/components/ooui.ts` 提供：
  - `ensureOOUI()`：按序注入 `jquery → oojs → oojs-ui → 主题` 四个脚本到全局，返回 OO 命名空间。
    - 脚本注入必须 `script.async = false`（动态脚本默认按**下载完成顺序**执行，大文件会乱序）；
    - 每个脚本带 id 去重（防 HMR/StrictMode 双跑导致 `customElements.define` 重复注册）；
    - 模块级 promise 单例（StrictMode effect 双调用只注入一次）。
  - `unwrapJQuery($el)`：jQuery 对象 → 真实 DOM 节点（appendChild 用）。
- `playground/components/original.ts` 提供 `useOriginalWidgets(build)`：封装「ensureOOUI → build创建原版控件 → 卸载统一destroy」的通用容器逻辑，`createRowAppender` 输出与React侧逐行对照的“名称+控件”行。
- 对照页命名约定：`playground/pages/xxx-compare/index.tsx`，并在 `playground/routes.ts` 注册；页面内容置于 `CompareLayout` + `CompareColumns`（playground/components/CompareLayout.tsx）的左右对照区块内。

## 原版主题切换机制（对照页基础设施）

playground 头部下拉可在 wikimediaui/apex 两个原版主题间切换。主题 = JS 类实例 + 样式表两部分，机制与踩坑如下：

- **主题 CSS 以文本导入，不走文档样式注入**：`ooui.ts` 顶部 `import oouiWikimediaCssText from 'oojs-ui/dist/oojs-ui-wikimediaui.css?inline'` 经 Vite CSS 管线得到处理后的文本字符串。普通 import 会把两份主题样式无条件打进文档无法整体切换；`?raw` 则不会重写图标 url。
- **图标 url 构建期重写**：主题 CSS 内图标是相对路径（`themes/wikimediaui/images/icons/xxx.svg`），做成 Blob URL 后相对引用会以 `blob:` 为 base 而全部失效。`?inline` 导入时 Vite 的 CSS 管线会将 `url()` 重写为构建资源 URL（小图标内联为 data URI），文本即可直接 `new Blob([...])` + `URL.createObjectURL` 生成样式表地址（按主题缓存，避免重复生成）。
- **切换样式表用整节点替换，不用 `link.disabled` 互斥**：在样式表**加载完成前**设置 `disabled` 会中止加载，之后翻转标志位也不会恢复（浏览器行为）。`applyThemeCss(theme)` 直接移除旧 `<link>`、追加新节点，同一时刻只存在当前主题一个节点。
- **JS 侧：主题类共存，切换即重建实例**：两份主题脚本加载后主题类共存于 `OO.ui`（`WikimediaUITheme`/`ApexTheme`），`setOOTheme(theme)` 懒加载对应主题脚本后以 `ui.theme = new ThemeClass()` 重建实例（apex 按需懒加载，wikimediaui 随 `ensureOOUI()` 主流程注入）。原版控件在**构造时**读取主题实例，切换只影响此后新建的控件。
- **已挂载控件靠 remount 重建**：时序为先 `setOOTheme`（切 JS）→ `applyThemeCss`（切 CSS）→ `setTheme` 触发渲染；`playground/App.tsx` 内容区（Layout.Content）以 `key={theme}` 强制 remount，使两侧（原版与 React 版）已挂载控件在新主题下全部重建。

## 关键经验（踩坑沉淀）

### 动画与测量

- **frame 的 transition 只做 `opacity + transform`，不要 `all`**：布局属性（如 height）参与过渡会产生"从矮到高"的观感，且过渡期间 body 溢出出现滚动条。`opacity + transform` 是纯视觉效果，不影响布局。JSX 内联写如 `transition: 'opacity 0.25s, transform 0.25s'`。
- **测量必须在 paint 前完成**（`useLayoutEffect`），且**测量前瞬时钳制到初始值（如 `height: 0`）再设最终值**。若过渡含布局属性，钳 0 后 `scrollHeight` 仍会被上一帧盒子高度垫高，导致每次开合尺寸递增。
- **不要把会动画的属性写死在 JSX style**：React 每次渲染都会重置 DOM style，命令式设置的值会被抹掉（这是多个诡异 bug 的根源）。

### 事件与键盘

- **React 合成 `wheel` 事件是 passive 的**，`preventDefault()` 无效。需要阻止默认行为的滚轮处理必须用原生监听：`element.addEventListener('wheel', fn, { passive: false })`。
- `import { type KeyboardEvent } from 'react'` 会遮蔽 DOM 的 `KeyboardEvent`，导致 `document.addEventListener('keydown', ...)` 类型报错。规避：`import { type KeyboardEvent as ReactKeyboardEvent }`，或以 `globalThis.KeyboardEvent` 引用 DOM 类型。
- **非受控用法兼容**：类输入组件不能只依赖 `value` prop 变化触发副作用（非受控时 value 恒 undefined，effect 只跑一次）。用 `input` 事件监听（键入即时）+ `value` 依赖（程序化赋值/受控回流）双通道。
- **浮层的 Escape 统一在捕获阶段处理并 `stopPropagation`**（`hooks.ts` 的 `useDismissablePopover`）：Popup/MenuSelect/PopupToolGroup 都经它关闭。Dialog 的 ESC 是 React `onKeyDown`（冒泡阶段、绑在弹窗根），故弹窗内嵌套浮层的 ESC 只会关最内层浮层。新增浮层时必须复用该 hook，不要各自写 document 监听——否则 ESC 会同时关掉浮层与弹窗。
- a11y 布尔属性（`aria-selected`/`aria-checked` 等）写实际布尔值，不要写死 `false`。

### 共享抽象（改动前先查是否已有对应 hook）

`src/hooks.ts` 与 `src/utils.ts` 收敛了跨组件重复逻辑，新增/修改组件应优先复用而非再写一份：

- `useControlledValue` / `useControlledValueFallback`：受控/非受控值状态。
- `useMergedRefs`：同时持有元素引用并向外转发 ref（替代 `useImperativeHandle` 手工桥接）。
- `useCleanId`：生成不含 `:` 的 id 片段（`useId` 的 `:` 在 CSS 选择器中非法）。
- `useDismissablePopover`：浮层的外点/Escape 关闭，Escape 为捕获阶段 + `defaultPrevented` 守卫。
- `useMenuPopup`：Dropdown/ComboBoxInput 共用的菜单开合与键盘高亮（端点钳制不环绕）。
- `useAnchoredPanelLayout`：锚定浮层的定位与视口钳高（MenuSelect/PopupToolGroup），留白与方向经全局配置解析。
- `useAutoFocusPanel`：切换激活面板后聚焦其内首个可聚焦元素（IndexLayout/BookletLayout）。
- `useLayoutSelection`：布局激活项的统一"派生 + 失效补选"策略。
- `useOptionRegistry` / `useOptionDrag`：Select 系的选项 DOM 双向索引与拖拽选择。
- `FOCUSABLE_SELECTOR` / `getFocusableElements` / `getFirstFocusable`：可聚焦元素判定，全库统一口径。
- `toFlagArray`：标志参数归一化为数组。
- `es-toolkit` 的 `omit`：剥离仅供父级布局使用的选项元数据，避免落成 DOM 未知属性（布局类组件的 options 条目同时携带 `value` 等元数据与页面 props，渲染前经 `omit(option, [...])` 挡下）。`clamp`（数值钳制）与 `debounce` 等通用工具同样取自 `es-toolkit`，不要另行手写。

**选项选中态命名**：`Select` 系选项统一用基类 `OptionProps.selected`（含 Radio/Checkbox 型选项），内层原生控件再映射为 `checked`；不要给选项另起 `checked` prop。

**鼠标悬停高亮由父级持有**：Select 系选项自身不维护 hover 高亮，由 Select 统一经 `onMouseOver`/`onMouseLeave` 驱动 `highlighted`，使悬停高亮、键盘高亮、`aria-activedescendant` 与滚动进入视口指向同一条目。受控高亮（Dropdown/ComboBoxInput）须经 `Select.onHighlightedChange` 回写父级。
- **原版 `Tool.active` 兼作瞬时按压视觉态**：`ToolGroup` 在 mousedown 时 `pressed.setActive(true)`、松开复位，故原版 `onSelect` 内不能以 `isActive()` 取反实现切换（读到的是按压态），须用应用自有标志（官方 Demo 的 `reallyActive` 模式）。React 版已将两者分离：`pressed` prop 承载瞬时按压，`active` prop 为受控激活态，二者都映射到 `oo-ui-tool-active` 类。
- **工具组的 `align`**：原版 `Toolbar.insertItemElements` 把 `align:'after'` 的工具组移到 `$after` 容器（主题 CSS `.oo-ui-toolbar-after { float: right }`）。React 版由 `Toolbar` 按子元素的 `align` prop 分组渲染；工具组本体需把 `align` 解构掉，避免落成 DOM 属性。
- **工具按压视觉随指针/焦点移出清除**：原版 `ToolGroup` 把 `mouseover/mouseout/focus/blur` 一并委托在 `$group` 上，经 `onMouseOutBlur` 仅清除按压视觉，按压流本身继续（在同工具上松开仍会触发选择）。React 版中 `useToolGroupPressed` 返回的 `pressedName` 在被移出时上报 `null`，组容器经 `getToolHoverHandlers` 接入四个事件。

### 对照排查提醒

- **`MessageDialog` 的 `size` 只在 `open()` 的 data 里生效**：`MessageDialog.getSetupProcess` 每次打开都会执行 `this.size = data.size ?? this.constructor.static.size`（static 为 'small'），构造时传的 `{ size }` 配置会被覆盖。原版侧对照页要展示多尺寸弹窗时，尺寸必须经 `dialog.open({ size })` 传入（playground的dialog-compare页即因此踩坑）。
- **同一 `WindowManager` 的窗口按 `constructor.static.name` 注册**：`addWindows` 以类静态 name 为 key，同类多实例互相覆盖，只有最后一个真正挂载。同类多窗口需各自配一个 manager（playground的dialog-compare页五尺寸即五个manager）。
- **工具在工具栏内按组独占**：`ToolGroup.populate` 经 `toolbar.isToolAvailable(name)`/`reserveTool` 预留工具，同一工具在一条工具栏内只能进一个工具组；被别的组预留后本组 `populate` 拿不到工具，组被标记 `oo-ui-toolGroup-empty`（`display:none`）静默隐藏。对照页安排多组工具时各组必须用不同的工具名（playground的toolbar-compare页即因此踩坑）。
- **`OO.ui.isMobile()` 在当前版本（0.54.1）dist 中仍是恒返回 `false` 的桩函数**。原版所有依赖它的移动端分支（TabOption 选中后居中滚动、`DropdownInputWidget` 切原生 select、`IndexLayout.autoFocus` 抑制等）在这版 OOUI 里都不会进入。遇到这类「原版有、React 版没有」的差异时，先确认原版该分支是否真的可达，再决定是否补实现或按对齐处理。本工程已将 `isMobile` 映射为 `OOUIProvider` 配置（见下节），配置后这些分支即变为可达，补齐对应行为前先记入 TODO.md。
- 原版 `FloatableElement` 的 `hideWhenOutOfView` 只给浮层加 `oo-ui-element-hidden` 类，并**不**改写 `aria-expanded`。React 版的 `outOfView` 收敛在组件内部、由调用方维持 `aria-expanded`，两者行为一致，不是差异。

## 全局能力映射（OOUIProvider ↔ OO.ui 全局命名空间）

原版 OOUI 的可覆写模块级全局（`OO.ui.msg`、`OO.ui.isMobile`、`OO.ui.getViewportSpacing`、`OO.ui.getTeleportTarget` 等）在 React 语境下统一收敛到 `src/config.tsx` 的 `OOUIProvider`（context）。新增全局能力时**扩展 `OOUIConfig` 并配套 use hook**，不要再造模块级可变全局：

| 原版全局 | 本工程对应 | 说明 |
| --- | --- | --- |
| `OO.ui.msg.messages` / `OO.ui.msg` | `messages` 配置 + `useMessage`；`msg`/`registerMessages` 供命令式 API | 命令式 API 在 React 树外渲染拿不到 context，走模块级覆盖表 |
| `OO.ui.getTeleportTarget` / `$overlay` | `getPortalContainer` | 浮层 portal 容器 |
| `OO.ui.isMobile()`（恒 false 的桩） | `isMobile` 配置 + `useIsMobile()` | 消费点：Index/BookletLayout 的 autoFocus 抑制、ProcessDialog 的 `oo-ui-isMobile` 类 |
| `OO.ui.getViewportSpacing()`（缺省 0） | `viewportSpacing` 配置 + `useViewportSpacing()` | 本工程缺省各边 5px（`VIEWPORT_SPACING`），较原版默认收紧防贴边 |
| `Element` 的 `dir` 配置 | `dir` 配置 + `useDir()` | 浮层 portal 至 body 后不继承内容区方向，按锚点元素 computed direction 解析（对齐 `Element.static.getDir`），可被 `dir` 配置覆盖；Popup 的 before/after 与 align 为逻辑方位，RTL 下物理侧翻转（对齐原版 FloatableElement 按 direction 取 start/end） |
| `OO.ui.deferMsg` / `OO.ui.resolveMsg` | `deferMsg` / `resolveMsg`（i18n.ts） | 值为函数的消息在调用时才取值 |

不映射的宿主环境全局（`bind`/`infuse`/`warnDeprecation`/`getUserLanguages`/`isSafeUrl`/`EventSequencer` 等）见 TODO.md 舍弃节；`debounce`/`throttle` 不进导出面，内部直接用 es-toolkit。

## 浏览器自动化验证注意（trae 浏览器桥限制）

- `browser_evaluate` 的脚本**不能包含 IIFE/`function` 关键字**（静默返回 undefined），用语句序列 + 箭头函数 + 末尾表达式：`var el=...;JSON.stringify(...)`。
- `press_key` 的修饰键（Ctrl/Alt）不生效，`click` 不设置 DOM focus。需要修饰键或精确焦点时，向目标元素 `dispatchEvent(new KeyboardEvent('keydown', {key, ctrlKey, bubbles: true}))`（React 合成事件靠冒泡捕获 ✓）。
- 桥单次往返 >250ms，无法抓动画中间帧；时序验证用 `MutationObserver` 记录 class 变更时间线。
- 页面上有多个同类控件时，`querySelector` 全局查询会串结果（如侧栏的语言下拉、原版残留的选中高亮），读取时限定容器或按索引取。
- 控制台错误用 `console_messages` 的 `[error]` 段定位；注意 dev-server 自身的 URL 含 "errors=true" 会干扰过滤。

## 验收清单

- [ ] `pnpm typecheck` 零错误
- [ ] 对照页并排：肉眼对比动画观感、焦点行为、键盘全流程
- [ ] 原版有而 React 版缺的行为：要么补齐，要么记入 TODO.md
- [ ] a11y 属性（aria-*、role）与原版 DOM 一致
- [ ] 非受控 + 受控两种用法都验证
