## 底层

- [x] 将Icon、Indicator等常见复用元素封装
- [x] 复用组件类生成逻辑（比如根据disabled生成`oo-ui-widget-disabled`或`oo-ui-widget-enabled`类
- [ ] 错误处理逻辑

## 优先实现

- [x] 图标（Icon、Indicator）
- [x] 按钮（Button）
- [x] 文本输入框（TextInput）
- [x] 数字输入框（NumberInput）
- [x] 勾选框（CheckboxInput）
- [x] 下拉框选择（Dropdown）
- [x] 多行输入框（MultilineTextInput）
- [x] 单选框（RadioSelect）
- [x] 弹窗（Dialog）
- [x] popup（Popup/PopupButton）
- [x] 字段集（FieldsetLayout，含弹出帮助）
- [x] 多选框组（CheckboxMultiselect，含Shift+点击范围选择、方向键焦点导航）
- [x] 册页布局（BookletLayout，含outlined/continuous/autoFocus/editable）
- [x] 消息（Message）
- [x] 输入弹窗（prompt）
- [x] 表单（FormLayout/ActionFieldLayout，及ButtonInput/DropdownInput/RadioSelectInput/CheckboxMultiselectInput）
- [x] 工具栏（Toolbar/Bar/List/MenuToolGroup）
- [x] 备选项输入框（ComboBox）
- [x] 流程弹窗（ProcessDialog）与进度条（ProgressBar）

## 低优先度实现

- [ ] 滑动（ToggleSwitch）
- [x] Tab（IndexLayout/TabSelect/TabOption/TabPanelLayout）
- [x] Menu
- [ ] 搜索输入框
- [ ] 其他布局类组件

## 未对齐行为记录

与原版 oojs-ui 的行为差异，按性质分三部分：

- **舍弃**：有意不做。原版行为对本工程没有使用场景，或 React 版有意采用不同做法。
- **增强**：有意多做。原版没有、React 版主动新增的行为或能力（含修正原版缺陷）。
- **暂不实现**：原版有、本工程也认可其价值，但当前没做（含只做了简化版）。

### 舍弃

- **TabOption 不支持 `href` 链接**。原版这个能力只有 PHP 端在用，React 版暂无需求。
- **prompt 的 `textInput.value` 只作为初始值**。弹窗存活期间无法从外部修改输入值，输入内容由 prompt 内部维护。这一点与原版语义一致：原版 `TextInputWidget` 的 `value` 配置同样只在构造时生效。
- **Message 的关闭按钮只回调 `onClose`，不自行隐藏**，显隐交由调用方控制。这是对齐 React 受控惯例；原版 `toggle(false)` 会内置隐藏。
- **ActionFieldLayout 用 `fieldInline` prop 声明输入区包装元素**（默认 `div`）。原版靠字段控件根元素的 tagName 自动判断 span/div，React 无法探测子组件的元素类型。
- **工具栏不再经 `ToolFactory` 注册工具**，改为 ToolGroup 的声明式 `tools` props，工具激活态由调用方受控。对应原版的 `tool.setActive` + toolbar `updateState` 事件。
- **未实现工具级快捷键提示**。原版 OOUI 本身也没有快捷键系统，`getToolAccelerator` 只是留给宿主覆写的钩子。
- **ProcessDialog 用 `onAction` 异步回调编排动作**，替代原版 `getActionProcess` 的 `OO.ui.Process` 多步 `.next()` 链。多步流程在同一异步函数内串联，因此不可中断（原版可 abort）。
- **原版 OO.ui 命名空间中宿主环境性质的全局工具不映射**：`bind`（jQuery proxy）、`infuse`（PHP 服务端渲染水合）、`warnDeprecation`、`getUserLanguages`/`getLocalValue`（MediaWiki 多语言回退）、`isSafeUrl`（仅 TabOption href 使用，本工程已舍弃该能力）、`EventSequencer`（底层事件时序，React 事件系统无使用场景）、`generateElementId`（React `useId` 已覆盖）。`debounce`/`throttle` 亦不进导出面，组件内部直接使用 es-toolkit。
- **Popup 在滚动引起裁剪变化时仍会重新判定翻转方向**。原版 `FloatableElement` 的注释明确「滚动时不再翻转」，React 版有意保留重判定。
- **CheckboxMultioption 的根元素用 `role='checkbox'` + `aria-checked`**，内层是原生 checkbox。原版 `OptionWidget` 根为 `role='option'`（由 `SelectWidget` 的 `listbox` 承载）；React 版若改成 `option` 会与内层原生控件语义重复，故保留 checkbox 语义。
- **Select 系选项的选中态统一用基类 `OptionProps.selected`**，Radio/Checkbox 型选项在内层原生控件上再映射为 `checked`。原版各 OptionWidget 分别用 `setSelected`/`setChecked` 等维护；React 版认为选中语义相同，不对外暴露多种命名。
- **布局组件的受控 API 统一为 `value`/`defaultValue`/`onChange`**（`StackLayout`、`IndexLayout`、`BookletLayout`）。原版经 `setItem`/`setPage`/`setTabPanel` 等 setter 命令式切换；`StackLayout` 原先公开的 `activeValue` 已并入 `value`。

### 增强

- **TabSelect 修掉了原版拖拽的一个缺陷**。原版的 `selecting` 在丢失 mouseup（例如按住鼠标拖出窗口再松开）后会残留，下次点击空白处会误提交旧选项；React 版在 mousedown 时重置拖拽状态，并监听 `pointercancel` 清理。（按住拖动跨选项选择原版已实现，未改动。）
- **工具栏面板支持按 Escape 收起**。原版只能靠鼠标或键盘在面板外松开时收起，没有 Escape 键。
- **BookletLayout 在激活页签被移除时自动补选相邻页签**，非受控直接生效，受控则由父组件决定是否采纳。原版不补选，其 `removePages` 注释明确表示「选哪页属业务逻辑」。
- **ProgressBar 把 `progress` 钳制在 0–100**，非有限值（NaN 等）按不定进度处理。原版 `setProgress` 不钳制，NaN 会直接输出 `width: NaN%` 和 `aria-valuenow="NaN"`。

### 暂不实现

- **Popup 的容器探测与翻转判定是简化版**：
  - 容器钳制：原版会按 `$container`（默认就近滚动容器）和 `containerPadding` 把弹层钳制在容器内；React 版只向上找第一个 `overflow: auto/scroll` 祖先，未完整复刻 `getClosestScrollableElementContainer`。
  - 自动翻转：React 版按预计算的两侧空间比较，原版是先定位再测量。
- **MenuSelect（Dropdown 菜单）的浮动定位是简化版**：
  - 定位方式：原版 `FloatableElement` 基于 offsetParent 做相对定位，并计入 RTL 方向与滚动条沟槽；React 版直接 portal 至 body，用页面坐标定位（RTL 起始边对齐已对齐，滚动条沟槽未计入）。
  - 裁剪锚点：原版 `ClippableElement` 锚定就近滚动容器；React 版锚定视口，`hideWhenOutOfView` 也简化成视口判定，未复刻基于 `$floatableClosestScrollable` 的精确判定。
  - `$overlay` 配置已由 `OOUIProvider.getPortalContainer` 承接，不再是差异。
- **ComboBoxInput 的菜单浮层定位同上**（MenuSelect 简化版）。菜单展开时机是等效实现：原版 `onEdit` 监听多种事件后再 toggle。
- **工具栏的以下能力未实现**：
  - PopupToolGroup：面板 portal 至 body 后按视口口径定位、固定左对齐；原版 `FloatableElement` 会按左右空间选择对齐侧、空间不足时填充容器，这部分未实现。窄栏类已按原版 `setNarrow` 下发到面板的窄栏载体，定位与钳高和 MenuSelect 共用同一实现。
  - `narrowConfig`：窄栏下切换工具或把手的配置。
  - `PopupTool` 与 `ToolGroupTool`：工具内嵌工具组的场景。
- **`confirm`/`alert`/`prompt` 是简化实现**：原版经全局单例 WindowManager 异步开关窗口（`openWindow`/`closeWindow` 返回 Promise），React 版各弹窗独立挂载、无同一管理器的开窗队列（重复调用会层叠而非替换前一个）；ESC/焦点陷阱绑定在弹窗自身，多层层叠时天然只有顶层响应。
- **MessageDialog/ProcessDialog 的移动端与 RTL 适配分支未实现**：原版 `fitActions`/`fitLabel` 在移动端（`oo-ui-isMobile`）与 RTL 下有独立的空间分配布局；React 版已按原版构造函数下发 `oo-ui-isMobile` 类（`OOUIProvider.isMobile`），适配布局本身未实现。
- **Dialog 的焦点陷阱大部分已对齐，剩下 `toggleIsolation` 未实现**：
  - 已对齐：Tab 闭环（focusTrap 类 + focus 重定向 + content `tabIndex=-1`）、`role='dialog'` 挂载在 `.oo-ui-window` 根、关闭 teardown 后归还打开前的焦点（对应原版 `WindowManager.$returnFocusTo`）；带标题的 `ProcessDialog`/`MessageDialog` 已用 `aria-labelledby` 关联标题（对应原版 `Dialog.initialize` 的 `title.getElementId()`）。
  - 未实现：原版 `toggleIsolation` 会给兄弟节点加 `inert`/`aria-hidden` 做隔离。本工程的 Popup、MenuSelect 等浮层 portal 至 body，一刀切隔离会误伤弹窗内的浮层（导致无法交互），需等浮层 portal 容器支持豁免标记后再做。
  - 另外，裸 `Dialog` 没有内置标题，调用方需自行用 `aria-labelledby` 关联。
- **FieldLayout 未复刻原版 `align='inline'` 在字段非内联时降级为 `'top'` 的校验**。原因与 `ActionFieldLayout` 的 `fieldInline` 同源：React 无法探测子组件的元素类型。
