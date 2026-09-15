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
- **同类交互必须收敛到同一个 hook，不得按组件手抄**：按键前缀跳转、相对导航、按压态、浮层关闭、选项过滤等交互在原版里各组件共享基类方法，React 版应对应共享 hook/纯函数（索引见「共享抽象」）。若发现同一交互已有多份手写实现，优先抽取收敛而不是在新组件里再抄一份。`usePressedState`、`useMenuPopup.handleNavigationKey`/`consumeNavigationKey`、`useGroupKeyboardSelection`、`findRelativeSelectableItem`、`useDismissablePopover` 即为此类收敛产物。
- **回调用 ref 承载、而非进依赖数组**：最新值/回调统一经 `useLatestRef` 读取，使 effect 与 document 监听只随真正需要的开关挂卸，避免内联箭头函数每渲染重挂监听。已有正例：`useControlledValue.commit`（useCallback 稳定）、`useDismissablePopover`、`useAutoFocusPanel`、`usePressedState`。
- **Hook 不可置于短路/条件表达式中**：如 `idProp ?? \`...${useCleanId()}\`` 会在 idProp 有值时跳过 Hook 调用，同一实例切换时 React 抛 "Rendered fewer hooks than expected" 并卸载整树。先生成再合并。
- **`hidden="until-found"` 不要同时标记 `aria-hidden`**：`until-found` 的语义是"对浏览器查找可见、对用户暂时不可见"，持续向辅助技术声明不可见会与查找命中激活面板的意图冲突。`Layout` 仅在 `hidden === true` 时输出 `aria-hidden`。
- a11y 布尔属性（`aria-selected`/`aria-checked` 等）写实际布尔值，不要写死 `false`。
- **`tabIndex` 统一走 `resolveTabIndex(tabIndex, disabled)`**（utils.ts）：原版 `TabIndexedElement.updateTabIndex` 是 **disabled 覆盖显式值**（`isDisabled() ? -1 : tabIndex`，注释 "Do not index over disabled elements"），启用时缺省 0。两个落点规则同样来自原版：① tabIndex 必须落在与 `$tabIndexed` 相同的元素上（Button/ToggleButton→锚点 `a`、InputWidget 全族含 Checkbox/Radio/ComboBox→`input`、ButtonInput→真实 button/input、Dropdown→handle、ToggleSwitch/RadioSelect/TabSelect→根元素；DropdownInput/RadioSelectInput 转发给内部控件），**不要落在不可聚焦的外层容器上**；② `aria-disabled` 也写在该元素上——ChromeVox/NVDA 不继承父元素的 `aria-disabled`，只标根会读不到。新增"可聚焦元素与根不同"的组件时按此两条接入。
- **"隐藏"的类未必是 `display:none`**：主题对隐藏菜单用 `width/height:0 + overflow:hidden`（`oo-ui-menuLayout-hideMenu`），其中可聚焦元素仍在 tab 序，构成隐形焦点陷阱。此类隐藏必须卸载子树或设 `inert`，只加 `aria-hidden` 不够。判断前先查主题 CSS 的实际属性。
- **选择组的键盘形态由选项的 `static.highlightable` 决定**：原版 `SelectWidget.onDocumentKeyDown`/`onDocumentKeyPress` 对命中项分流——可高亮则 `highlightItem`（↑↓移动高亮、Enter 选中），不可高亮则直接 `chooseItem`（↑↓即改选）。已核对的静态配置：`OptionWidget`/`MenuOptionWidget`/`OutlineOptionWidget` 为可高亮，`RadioOptionWidget`/`TabOptionWidget`/`ButtonOptionWidget`/`MenuSectionOptionWidget` 为不可高亮。故新增选择组时先查该静态值再决定用 `useMenuPopup` 的高亮导航还是 `useGroupKeyboardSelection`；`aria-activedescendant` 也随之分流（可高亮指向高亮项，不可高亮指向选中项）。
- **多选展示统一走 `Select.selectedValues`**：传入即进入多选展示（命中集合的选项输出选中态、`aria-multiselectable=true`，单值`value`不再参与展示），选中提交仍走 `onChange`/`onChoose`（单值语义），多选语义由调用方维护（MenuTagMultiselect 的标签集合）。`MenuSelect` 透传该prop，新增需要"菜单多项选中"的组件复用此通道，不要另建多选选择组件。
- **`choose` 与 `select` 是两个事件，别合并成一个回调**：原版 `chooseItem` 先 `selectItem`（命中已选中项时提前返回、不派发 `select`），再无条件的派发 `choose`；菜单的收起走的是 `MenuSelectWidget.hideOnChoose` 这一 `choose` 路径，与值是否变化无关。本工程菜单显隐由调用方持有，故 `Select` 同时给出 `onChange`（值变化）与 `onChoose`（每次选定，含重复选定当前项），前者先派发、后者随后，Dropdown/ComboBoxInput 用后者收起菜单——只用 `onChange` 会导致"重复选定当前项时菜单关不掉"。
- **按钮式选项要放行 mousedown**：原版 `ButtonElement.static.cancelButtonMouseDownEvents` 缺省 `true`（mousedown 时 `preventDefault` 以阻止焦点转移），`ButtonOptionWidget` 专门置为 `false` 让事件穿透给父级选择组（否则父级的按压/拖拽选择收不到），`ButtonWidget` 同样为 `false`。React 版中选项不自行处理 mousedown，由 `useOptionDrag` 在组根上统一接管。
- **组级禁用经 Context 下发，不用 `cloneElement`**：`ButtonGroup` 经 `ButtonGroupDisabledProvider`/`useButtonGroupDisabled` 下发组禁用态，组内按钮自行与 `disabled` 取或。`cloneElement` + `child.type === Button` 会静默漏掉 ToggleButton 等组合形态、包一层的 Button 与 memo 后的 Button（原实现即存在此漏失）。
- **输入框失焦提交文本时先收起浮层并清高亮**：TagMultiselect 的失焦会把输入框文本提交为标签，而候选菜单可能仍持有高亮项。原版 `MenuTagMultiselectWidget.onMenuToggle(false)` 的 `highlightItem(null)` 先于失焦提交生效，故不会把鼠标悬停/键盘高亮项当作输入内容提交。React 版在输入框 `onBlur` 中先 `setOpen(false)` + 清高亮，再以"忽略高亮"的方式提交文本；直接复用 Enter 的提交路径（会优先取高亮项）会在浮层点击后失焦时误把高亮项加回。
- **菜单开启时 Escape 的附带动作须经 `useDismissablePopover` 的 `onEscape` 回调**：浮层关闭监听在 document 捕获阶段消费 Escape 并 `stopPropagation`，组件的输入框 `onKeyDown` 收不到该事件（嵌套浮层只关最内层依赖此吞键）。原版 `MenuTagMultiselectWidget` 的 Escape 清空输入走输入框 keydown（`doInputEscape`），与菜单关闭两个都发生；React 版须在 `useMenuPopup`/`useDismissablePopover` 上传 `onEscape`（如 `() => setInputValue('')`）补齐，不要指望输入框的 Escape 分支在菜单开启时执行。
- **拖拽重排的实时预览必须走 React state，不要学原版搬 DOM 节点**：原版 `DraggableGroupElement.onDragOver` 在 dragover 时直接 `$(...).after(item.$element)` 搬动节点做预览换位，React 会因下次渲染的重排而抹掉这处手改。React 版把"预览顺序"作为 state（`previewKeys`）在 dragover 时更新、由渲染体现，drop/dragend 时才把顺序提交回 `value`。该状态机已收敛为 `widgets/TagMultiselect/useDraggableKeys.ts`（只吃「有序 key 序列 + 屏障项判定」，与标签无关，其它可拖拽组可直接复用）。
- **拖拽处理器须经 ref 读拖拽态，不能只依赖渲染期闭包**：`dragover`/`drop` 可能在同一次任务内紧随 `dragstart` 触发（React 状态尚未回流），此时处理器闭包里的 `draggingKey` 仍是旧值、整段拖拽会静默失效。`useDraggableKeys` 的拖拽态同时写入 ref 与 state（ref 供处理器同步读取、state 驱动渲染）。用合成 drag 事件做自动化验证时会必然踩到这一点。
- **原生 HTML5 DnD 的类由主题 CSS 承担，JS 只需输出类与属性**：`oo-ui-draggableElement-handle:not(-undraggable)` 给 grab 光标、`-placeholder{opacity:.2}` 给原地占位观感、`-clone` 在 wikimediaui 无规则（仅用于 Chrome 原生拖影）；不可拖时靠 `-undraggable` + `draggable=false` 撤下（原版 `toggleDraggable` 即如此）。原版把项下标写进 jQuery 内部数据（`$element.data('index')`，DOM 上不可见），React 版写成 `data-index` 属性以便 dragover 命中——行为等价，仅是取值通道不同。
- **`updateInputSize` 的基准是 `position: relative` 的 content 元素**：原版 `$lastItem.position().left` 取的是相对 offsetParent（即 `.oo-ui-tagMultiselectWidget-content`，它 `position: relative`）的位置再减去元素自身 `marginLeft`。inline 模式下输入框恒为标签组末个子元素，故 `$lastItem` 就是输入框自身；实测空态 `474 − (−2) − 14 − 13 = 449` 与该式吻合。复刻时必须先把输入框钳到 `1em` 再读位置：否则过宽的旧宽度会把输入框挤到下一行，读到的是换行后的位置。

### 共享抽象（改动前先查是否已有对应 hook）

`src/hooks.ts` 与 `src/utils.ts` 收敛了跨组件重复逻辑，新增/修改组件应优先复用而非再写一份：

- `useControlledValue` / `useControlledValueNotify`：受控/非受控值状态；后者在受控值非法（不在可用值集合内）时把生效值回写父级，同一非法值仅回写一次（父级未采纳时不反复触发），`useLayoutSelection` 的受控回写共用同一守卫。返回值含 `commit` 与 `commitIfChanged`：**选择集类组件的选中提交一律用后者**（对齐原版 `selectItem` 对已选中项的提前返回，重复选中同一项不派发事件；Select/TabSelect/ButtonSelect/Dropdown/ComboBoxInput 皆此），输入类组件必须用前者（"始终转发"是刻意语义）。
- `useMergedRefs`：同时持有元素引用并向外转发 ref（替代 `useImperativeHandle` 手工桥接）。
- `useCleanId`：生成不含 `:` 的 id 片段（`useId` 的 `:` 在 CSS 选择器中非法）。
- `useDismissablePopover`：浮层的外点/Escape 关闭，Escape 为捕获阶段 + `defaultPrevented` 守卫。`ignore` 为忽略目标白名单（ref 或真实元素数组），浮层自身根节点须列入（Popup 传入 portal 根 `rootRef` 与 `autoCloseIgnore`）。
- `useMenuPopup`：Dropdown/ComboBoxInput 共用的菜单开合与键盘高亮（端点钳制不环绕）。导航键（↑↓/Home/End/PageUp/PageDown）经返回的 `handleNavigationKey` 统一处理（翻页 ±10 与原版一致），组件内不要再手写按键分支；Home/End/PageUp/PageDown 的"仅展开时生效 + preventDefault"走 `consumeNavigationKey`（与 `handleNavigationKey` 的区别是它额外包含这两件事，供 `onKeyDown` 直接转调）。
- `usePressedState`：鼠标/键盘按压态的进入与复位（document 级 capture `mouseup`/`keyup` 兜底），Button/ButtonInput/Tool 组共用。组内委托场景经 `resolveTarget` 从事件 target 解析目标、`canPress` 过滤、`onTrigger` 在释放落在发起目标上时回调（Tool 组的 `onSelect` 位）。
  `onMouseDown`/`onMouseUp`/`onKeyDown`/`onKeyUp` 四个参数承接调用方透传的回调，**先于**按压逻辑无条件转发——按压逻辑含 disabled/非左键的提前返回，置于其后会导致这些分支下调用方收不到事件。Button/ButtonInput 经此串联用户回调，不再各自写包装函数。
- `useGroupKeyboardSelection`：直选型选项组（TabSelect/RadioSelect/ButtonSelect）的键盘改选，`selectableValues` 由调用方按展示顺序给出。选中提交带"值未变化不提交"守卫（对齐原版 `selectItem` 对已选中项的提前返回，`Select` 的 Enter 与拖拽提交同理）。与 `useMenuPopup` 同样的"同类交互收敛到同一 hook"约束。
- `findRelativeSelectableItem`（utils.ts）：相对定位可选值的纯函数，Select/TabSelect/RadioSelect 与菜单导航共用；`offset` 为相对步数（±1 步进、±10 翻页），`filter` 供前缀跳转。改端点/环绕/无选中起步等边界规则只改这一处。
- `useLatestRef`：渲染期同步最新值的 ref，供事件监听/定时器读取最新 props 而不重挂监听；`useControlledValue.commit`、`useControlledValueNotify`、`useDismissablePopover`、`useValidityFlag`、`useAutoFocusPanel`、`usePressedState` 等内部回调均经它稳定化。
- **选项集工具**（`utils.ts`）：`isSelectableOption`（带 value 且未禁用）、`getSelectableValues`（可选值序列）、`resolveSelectableValue`（非法受控值回退首个可选值）、`resolveOptionDisabled`（选项未声明 disabled 时继承组级 disabled）。Select/Dropdown/DropdownInput/ComboBoxInput/RadioSelect/RadioSelectInput/TabSelect/CheckboxMultiselect 一律经此，不要再写一遍 `filter(…).map(…)` 或 `=== void 0 ?` 继承表达式；判定高频调用处（拖拽 `mousemove`、悬停）另建 `Set` 做 O(1) 命中。
- `resolveLayoutSelection`（`hooks.ts` 导出的纯函数）：布局激活值的"有效值原样、缺失/失效按邻近回退（原位置→前一项→首项）"派生；`prevOptions` 须传上一轮 options。
- `useAnchoredPanelLayout`：锚定浮层的定位与视口钳高（MenuSelect/PopupToolGroup），留白与方向经全局配置解析；方向按锚点元素缓存，避免滚动重算触发样式重算。
- `useAutoFocusPanel`：切换激活面板后聚焦其内首个可聚焦元素（IndexLayout/BookletLayout）。
- `useInlineInputWidth`：TagMultiselect inline 输入框的宽度自适应（铺满本行剩余空间，空间不足时换行取整行），对齐原版 `updateInputSize`。宽度**命令式**写 `style.width`（不得写进 JSX style，否则每次渲染被抹掉）；测量经离屏克隆完成，不改写受控输入框的 `value`（避免干扰值追踪与光标）；缓存占位符文本宽度避免其被裁切。因其硬编码 TagMultiselect 的 DOM 契约且只有这一个消费者，放在组件目录（`widgets/TagMultiselect/useInlineInputWidth.ts`）而非本共享层。

**hook 的位置按消费者数定**：本文件只收 ≥2 个组件共用的 hook（现存 `usePressedState`/`useValidityFlag`/`useMenuPopup`/`useLabelPadding`/`useAnchoredPanelLayout`/`useAutoFocusPanel` 无一例外）；单消费者的 hook 与组件同目录（`widgets/TagMultiselect/` 下的 `useInlineInputWidth.ts`/`useDraggableKeys.ts`、`widgets/Popup/popupLayout.ts` 的定位纯函数）。把单消费者逻辑放进本共享层会谎报共享关系并持续撑大本文件；待出现第二个消费者时再提升到此处。
- `useLayoutSelection`：布局激活项的统一"派生 + 失效补选"策略（派生走 `resolveLayoutSelection`）。返回的 `select`/`selectIfChanged` 把 IndexLayout/BookletLayout 各自手写的"同值不提交"守卫收敛到一处：`selectIfChanged` 与**生效值**比较（对齐原版 `BookletLayout.setPage` 与当前页比较的提前返回），受控值非法时点击回退项不重复派发。两者保持**一元签名**（不转发事件）——`ChangeHandler` 约定第二参数为 change 事件，而 `StackLayout.onPageFocus` 传来的是 FocusEvent，不进参数是从源头规避串味。
- `useOptionRegistry` / `useOptionDrag`：Select 系的选项 DOM 双向索引与拖拽选择。`useOptionRegistry` 须传入当前渲染的选项值列表——值移除时其 ref 回调缓存随之淘汰，避免长期运行下缓存累积。
- `widgets/Popup/popupLayout.ts`：Popup 定位的纯函数模块（翻转判定 / 方位与对齐→页面坐标 / 箭头腾挪 / 容器边界钳制 / 就近滚动容器探测），可独立单测；浮层定位逻辑的改动优先改这里，不要在组件内联计算。
- `useValidityFlag`：输入类组件的软校验反馈（输入元素 `aria-invalid` + 根元素 invalid 标志类，不改写值）。触发时机对齐原版 `setValidityFlag`：值变更防抖 250ms、失焦立即校验、聚焦清除；初始值不主动校验（NumberInput 的挂载期校验由组件经 `revalidate` 补齐，对齐原版 setRange/setStep 的构造期校验）。
- `FieldLabelLink`（Context）+ `useFieldInputId` / `useFieldLabelFocus` / `useFieldGroupLabelLink`：FieldLayout 的标签联动双通道，对齐原版按 `getInputId()` 分流的两条路径——输入类组件（通道A）认领字段 id 与 label 的 `htmlFor` 原生关联；无原生 input 的组件（通道B）注册标签点击激活回调（原版 simulateLabelClick）并经 labelId 挂 `aria-labelledby`（原版 setLabelledBy），aria 落点须与原版 `$tabIndexed` 同元素（如 Button 的 anchor、Dropdown 的 handle）。选项组容器（RadioSelect/CheckboxMultiselect）经 `useFieldGroupLabelLink` 屏蔽通道A后再向选项下发——组内多个 input 认领同一字段id会产生重复id且label误切首个选项，原版组容器 `getInputId()` 为 null 只走通道B。通道B激活回调含禁用态 guard（原版 focus() 内含 isDisabled 判断，禁用不聚焦）。新增字段组件按形态二选一接入，勿在 FieldLayout 里反射子组件。
- `useFieldLabelFocus`（通道B的推荐入口，内部经 `useFieldLabelActivate` 注册）：对齐原版 `TabIndexedElement.simulateLabelClick` 的默认实现——内部持有根元素 ref 并与外部转发的 ref 合并，点击标签时聚焦根元素，禁用时不聚焦。落点不是根元素或需附带副作用的组件传 `activate` 覆盖：Dropdown 聚焦 handle、ToggleButton 经内部锚点聚焦、ToggleSwitch 额外翻转值、CheckboxMultiselect 聚焦首个可用选项。返回值另含内部 `rootRef`，供组件自身读取（如 Dropdown 把它作为浮层忽略目标）。仅在不经过根元素的场景才直接使用 `useFieldLabelActivate`。
- `FOCUSABLE_SELECTOR` / `getFocusableElements` / `getFirstFocusable`：可聚焦元素判定，全库统一口径。
- `resolveTabIndex`（utils.ts）：可聚焦元素的 tabIndex 取值（disabled 优先，缺省 0），见上文 a11y 条目。
- `ElementOrRef` / `resolveElement`（utils.ts）：浮层锚点与"忽略目标"的入参形态（ref 或真实元素）及统一解析，浮层定位与关闭类逻辑共用。
- `OFFSCREEN_POSITION` / `VIEWPORT_SPACING`（utils.ts）：浮层未定位时的哨兵坐标与视口留白缺省值，MenuSelect/Popup/PopupToolGroup 共用，勿再写 `-9999`/`5` 字面量。
- `ButtonGroupDisabledProvider` / `useButtonGroupDisabled`（widgets/ButtonGroup/context.ts）：组级禁用下发通道，替代对 children 的 cloneElement 注入。
- `toFlagArray`：标志参数归一化为数组。
- **类生成模块（mixin贡献器）**：`getWidgetClassName` 折叠自 `widgetClasses`/`iconElementClasses`/`indicatorElementClasses`/`labelElementClasses`/`flaggedElementClasses`/`widgetNameClasses`，每个贡献器对齐原版一个 Element mixin（如 `labelElementClasses` 含原版 setInvisibleLabel 的"视同无标签"规则）。需要单个 mixin 的类时直接调贡献器，整组输出用折叠层；契约由 `src/utils.test.ts` 锁定，改期望值前先核对原版对应 mixin。TextInput 系组件的 `flags` prop（`FlaggedElement` 类型，utils.ts）经 `flaggedElementClasses` 输出，软校验的 invalid 标志经 `mergeInvalidFlag` 叠加其上（配置 flags 为声明式基线，不随校验通过移除——原版 config.flags 与 setFlags 共享存储的移除语义不适用于声明式 props）。
- **TextInput 系指示器解析**：`indicator` falsy（未指定）时回退 required 缺省指示器——对齐原版 `RequiredElement.setRequired` 的构造期条件改写（config 层面不存在"显式无"，falsy 指示器 + required 同样显示 required）。SearchInput 经内部通道 `indicatorOverride` 完全接管指示器槽位（`null`=明确无，抑制 required 回退），对齐原版 `SearchInputWidget.updateSearchIndicator` 构造后 `setIndicator(null)` 的覆写；`indicatorOverride` 是组件内部通道，勿在 SearchInput 之外使用。
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

## 浏览器自动化验证

工具选择：优先用当前工具链里能直接驱动浏览器的方式（IDE 内置的浏览器工具最省事）；没有则检查 `agent-browser`、`playwright` 是否可用；都没有时不要凭源码臆测交互结果，直接告知用户需要可用的浏览器工具。

无论用哪套工具，验证时按以下策略：

- 对照页必须**等原版脚本注入完成**后再断言（等待固定时长或轮询"原版已就绪"），否则会读到未初始化的原版侧。
- 行为断言以 **DOM 类名与 aria 属性**为准（`aria-selected`/`aria-activedescendant`/`oo-ui-widget-disabled` 等），与原版侧逐项比对，而非只看渲染结果。
- **浮层选择器必须分侧限定**：React 侧浮层 portal 到 `body`，原版侧挂在控件自身子树内；全局查询会先命中**另一侧已隐藏但仍留在 DOM 里**的浮层（隐藏是加 `oo-ui-element-hidden` 类而非移除节点），导致点错元素或"被其它元素遮挡"的误报。
- **逐步断言**：先读基线，再单步交互，再读增量。聚焦类操作本身可能顺带触发一次选中（语义随工具/浏览器而异），把多步操作塞进一次断言会让事件计数对不上。
- 视觉一致性用截图肉眼核对；出现疑似配色差异时用计算样式（`getComputedStyle`）复核，避免被截图缩放与抗锯齿误导。
- 验收结束后关闭浏览器会话，并复原环境（停掉自己启动的 dev server、清理临时文件）。

## 验收清单

- [ ] `pnpm typecheck` 零错误
- [ ] 对照页并排：肉眼对比动画观感、焦点行为、键盘全流程
- [ ] 原版有而 React 版缺的行为：要么补齐，要么记入 TODO.md
- [ ] a11y 属性（aria-*、role）与原版 DOM 一致
- [ ] 非受控 + 受控两种用法都验证
