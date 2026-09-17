## 未对齐行为记录

与原版 oojs-ui 的行为差异，按性质分四部分：

- **舍弃**：有意不做。原版行为对本工程没有使用场景，或 React 版有意采用不同做法。
- **增强**：有意多做。原版没有、React 版主动新增的行为或能力（含修正原版缺陷）。
- **等效替代**：原版行为本工程也具备，只是实现形态、落点或通道不同（含已对齐项的对应关系留档），效果等价——**无需补做**。与「舍弃」的界限是能力作不作数，与「暂未实现」的界限是有没有缺口。
- **暂未实现**：原版有、本工程也认可其价值，但当前没做（含只做了简化版），最终发布应当清空。

### 舍弃

- **TabOption 不支持 `href` 链接**。原版这个能力只有 PHP 端在用，React 版暂无需求。
- **prompt 的 `textInput.value` 只作为初始值**。弹窗存活期间无法从外部修改输入值，输入内容由 prompt 内部维护。这一点与原版语义一致：原版 `TextInputWidget` 的 `value` 配置同样只在构造时生效。
- **Message 的关闭按钮只回调 `onClose`，不自行隐藏**，显隐交由调用方控制。这是对齐 React 受控惯例；原版 `toggle(false)` 会内置隐藏。
- **工具栏不再经 `ToolFactory` 注册工具**，改为 ToolGroup 的声明式 `tools` props，工具激活态由调用方受控。对应原版的 `tool.setActive` + toolbar `updateState` 事件。
- **内嵌工具组（`ToolProps.group`）的工具位不输出图标与标签类**。原版这两个类确实加在工具根元素上（构造期 `IconElement.setIcon`/`Tool.setIcon`），但主题里依赖它们的规则全部以 `.oo-ui-tool-link` 为后代选择器，而该链接已被 `ToolGroupTool` 移除（`this.$link.remove()`），类无生效规则；React 版干脆不输出。
- **工具栏/工具组无事件面**。原版 `Toolbar` 与 `ToolGroup` 都有事件（`updateState`/`active`/`disable` 等，`PopupTool.onPopupToggle` 与 `ToolGroupTool` 都会经工具组 `active` 事件冒泡到 `Toolbar.active`，MediaWiki 侧常用于保持工具栏可见）；React 版全部改为受控 props 与回调，不移植事件系统。
- **未实现工具级快捷键提示**。原版 OOUI 本身也没有快捷键系统，`getToolAccelerator` 只是留给宿主覆写的钩子。
- **ProcessDialog 用 `onAction` 异步回调编排动作**，替代原版 `getActionProcess` 的 `OO.ui.Process` 多步 `.next()` 链。多步流程在同一异步函数内串联，因此不可中断（原版可 abort）。
- **原版 OO.ui 命名空间中宿主环境性质的全局工具不映射**：`bind`（jQuery proxy）、`infuse`（PHP 服务端渲染水合）、`warnDeprecation`、`getUserLanguages`/`getLocalValue`（MediaWiki 多语言回退）、`isSafeUrl`（仅 TabOption href 使用，本工程已舍弃该能力）、`EventSequencer`（底层事件时序，React 事件系统无使用场景）、`generateElementId`（React `useId` 已覆盖）。`debounce`/`throttle` 亦不进导出面，组件内部直接使用 es-toolkit。
- **Popup 在滚动引起裁剪变化时仍会重新判定翻转方向**。原版 `FloatableElement` 的注释明确「滚动时不再翻转」，React 版有意保留重判定。
- **CheckboxMultioption 的根元素用 `role='checkbox'` + `aria-checked`**，内层是原生 checkbox。原版 `OptionWidget` 根为 `role='option'`（由 `SelectWidget` 的 `listbox` 承载）；React 版若改成 `option` 会与内层原生控件语义重复，故保留 checkbox 语义。
- **Select 系选项的选中态统一用基类 `OptionProps.selected`**，Radio/Checkbox 型选项在内层原生控件上再映射为 `checked`。原版各 OptionWidget 分别用 `setSelected`/`setChecked` 等维护；React 版认为选中语义相同，不对外暴露多种命名。
- **布局组件的受控 API 统一为 `value`/`defaultValue`/`onChange`**（`StackLayout`、`IndexLayout`、`BookletLayout`）。原版经 `setItem`/`setPage`/`setTabPanel` 等 setter 命令式切换；`StackLayout` 原先公开的 `activeValue` 已并入 `value`。
- **选项族不支持 `flags`**。原版 `OptionWidget` 混入 `FlaggedElement`，选项可经 `flags` 输出 `oo-ui-flaggedElement-*` 并影响图标变体（progressive/destructive/error/warning/success）；本工程选项族（MenuOption/OutlineOption/TabOption/ButtonOption 等）未开放该配置，`ButtonOption` 的图标/指示器变体只按"带边框且激活或禁用则反色"输出。
- **TagMultiselect 的 `value`/`onChange` 包含非法标签**。原版 `getValue()` 只返回合法标签（`items.filter(item => item.isValid())`），非法标签仅展示、不进值；React 版的 `value` 即标签集合本身（含非法项），以适应受控语义——若按原版过滤，受控父级回写会丢失非法标签（显示项与值不一致）。
- **未实现 `PopupTagMultiselectWidget`**。原版该类构造期即 `warnDeprecation`（建议改用 `MenuTagMultiselectWidget`），本工程不提供。
- **标签数据限于 `string | number`**。原版标签 data 可为任意对象（`{data,label}` 形态），本工程与选择族一致，值统一为 `string | number`，标签文本取自菜单选项 `label` 或值本身。
- **TagMultiselect 不开放替换内部输入控件**。原版 `config.input`/`config.inputWidget` 可替换内部输入控件，React 版内置输入框，对齐其余组件不暴露内部输入控件的做法。
- **弹窗滚动锁不含 iOS 触摸滚动 hack**。原版 `togglePreventIosScrolling` 针对 iOS Safari 无视 `body { overflow: hidden }` 的问题，仅在 iOS 设备且打开 full 尺寸弹窗时保存/恢复滚动位置并加 `oo-ui-windowManager-ios-modal-ready` 类；触发条件窄且需移动滚动位置，成本与收益不对等，React 版不实现。
- **`label` 的有效性真值与原版不同**。原版 `LabelElement.setLabel` 只认非空字符串（数字、布尔一律归为无标签），本工程 `hasLabel` 把 `0`/`true` 等可渲染 ReactNode 视为有标签（JSX 会实际渲染出内容），相应输出 `oo-ui-labelElement` 与标签内容。

### 增强

- **TabSelect 修掉了原版拖拽的一个缺陷**。原版的 `selecting` 在丢失 mouseup（例如按住鼠标拖出窗口再松开）后会残留，下次点击空白处会误提交旧选项；React 版在 mousedown 时重置拖拽状态，并监听 `pointercancel` 清理。（按住拖动跨选项选择原版已实现，未改动。）
- **工具栏面板支持按 Escape 收起**。原版只能靠鼠标或键盘在面板外松开时收起，没有 Escape 键。
- **弹出工具（`ToolProps.popup`）的 `onSelect` 仍会触发**。原版 `PopupTool.onSelect` 被 `popup.toggle()` 占用，调用方拿不到选中通知；React 版按压流照常回调 `onSelect`，浮层开合由工具自身的点击/按键驱动，显隐变化另经 `popup.onOpenChange` 通知。
- **弹出工具的 `autoFlip` 可配置**。原版构造期无条件 `setAutoFlip(false)`，`config.popup.autoFlip` 传了也不生效；React 版默认同样为 `false`（对齐原版），但允许调用方显式打开翻转。
- **BookletLayout 在激活页签被移除时自动补选相邻页签**，非受控直接生效，受控则由父组件决定是否采纳。原版不补选，其 `removePages` 注释明确表示「选哪页属业务逻辑」。
- **ProgressBar 把 `progress` 钳制在 0–100**，非有限值（NaN 等）按不定进度处理。原版 `setProgress` 不钳制，NaN 会直接输出 `width: NaN%` 和 `aria-valuenow="NaN"`。
- **Select 根元素可聚焦，FieldLayout 标签点击会聚焦根**。原版 `SelectWidget` 无 `TabIndexedElement`（根不可聚焦），`simulateLabelClick` 继承基类的空操作，标签点击无任何效果；React 版为 listbox 键盘可达性给根加了 `tabIndex`，标签点击随之聚焦根（与 RadioSelect 行为一致）。
- **ButtonSelect 的 `aria-activedescendant` 在初始选中时即输出**。原版 `SelectWidget.selectItem` 只在选中项变化时写入该属性，带初始选中值的控件首帧没有该属性；React 版按声明式状态始终输出选中项 id。
- **CopyTextLayout 的复制优先走 `navigator.clipboard`**，不可用或被权限拒绝时回落到原版的 `document.execCommand('copy')`。原版仅用后者，该 API 已废弃，在非安全上下文或部分浏览器中静默失败且无从感知。
- **HiddenInputWidget 的 `disabled` 落到原生属性上**。原版经 `Widget.setDisabled` 只切换 `oo-ui-widget-*` 类并移除 `aria-disabled`，被"禁用"的隐藏输入仍会随表单提交；React 版按标准 `disabled` 语义让它退出提交。
- **ButtonOption 的选中态图标/指示器一律反色**。原版 `ButtonOptionWidget` 构造期 `setSelected` 会 `setActive(true)`，但随后 `ButtonElement` 构造函数把 `this.active` 复位为 `false`，导致"初始选中"的按钮不反色、"用户点选后"的按钮才反色（同一状态两种表现，实测确认）；React 版按主题规则（带边框按钮在激活或禁用时反色）统一输出。
- **Button 系列不输出 `oo-ui-buttonElement-size-medium`**。原版 `ButtonElement.setSize` 缺省写入尺寸类（`medium`），该类在 wikimediaui/apex 主题 CSS 中均无定义、不产生样式；React 版 Button/ButtonInput/ButtonOption 一律不输出。
- **固定标签不可拖拽，且非固定标签不得被拖到固定标签之前**。原版虽在 `TagItemWidget` 上实现了 `fixed`（不渲染关闭按钮、不可移除/编辑），但标签多选族没有开放该配置的入口（`MenuTagMultiselectWidget.createTagItemWidget` 不传 `fixed`），故实际不可达、标签恒可拖可移除。React 版在 `TagOptionProps` 上开放 `fixed`，并让拖拽的目标下标钳制在固定区之后，使固定项顺序不受拖拽影响。
- **ButtonMenuSelectWidget 的 `aria-owns` 常驻，键盘展开同样输出按压态**。原版构造期写入的 `aria-owns` 会被菜单关闭时的 `MenuSelectWidget.onToggle`（`removeAttr('aria-owns')`）一并清掉，此后触发器不再声明所拥有的菜单；键盘展开的按压态也会被随后的 keyup 复位流清掉（鼠标展开则是按压态，同一状态两种表现）。React 版按声明式状态输出：`aria-owns` 常驻、`oo-ui-buttonElement-pressed` 恒随打开态。
- **ButtonMenuSelectWidget 支持方向键展开**（收起时↑/↓即展开）。原版仅 Enter/空格可展开（ButtonWidget 无方向键处理，菜单未展开时也不监听 document 键盘），方向键只在展开后由菜单接管。React 版与 Dropdown 行为一致：收起时↑/↓展开，展开后↑/↓移动高亮。
- **ButtonMenuSelectWidget 的键盘手势去重，选定/展开后不因 keypress 激活通道重新切换**。原版按键流里菜单的 document keydown 处理器虽对已消费按键 `preventDefault`，Chrome 仍会派发 keypress，`ButtonElement.onKeyPress` 的 click 模拟随即再次 `menu.toggle()`——键盘选定/展开后菜单会被重新开合（同一手势两次切换）。React 版以手势标记跳过同一次手势内 keypress 经 Button 键盘激活通道的重复切换（keyup 复位，抑制 keypress 的浏览器也不受影响）。
- **ButtonMenuSelectWidget/Dropdown 展开后空格可选定**。原版展开态按空格不被菜单消费（`MenuSelectWidget.onDocumentKeyDown` 无 SPACE 分支），keypress 照发经 `ButtonElement.onKeyPress` 的 click 模拟仅关闭菜单；React 版空格与 Enter 同分支直接选定高亮项（与按钮空格激活的 ARIA 惯例一致，Dropdown 同）。
- **PopupToolGroup 的 title 按窄栏生效值兜底**。原版 TitledElement 的「invisibleLabel → title」兜底只在构造期求值，而窄栏切换（`onToolbarResize` 只改写 invisibleLabel/label/icon）不会重算 title，故原版窄栏把手下没有 tooltip；React 版按窄栏生效的 `invisibleLabel`/`label` 计算，窄栏下仍有 tooltip。未设置 invisibleLabel 时两侧一致。
- **ButtonGroup 的组禁用下发给组内按钮**。原版 `ButtonGroupWidget` 无 `setDisabled` 覆写，仅给组根切换 `oo-ui-widget-disabled`/`-enabled`，组内按钮仍为 enabled（图标/指示器也因此不反色）；React 版经 Context 把组禁用与按钮自身 disabled 取或，组内按钮输出 disabled 态、按压与点击被拦截（对齐本工程「组禁用即各项禁用」的一贯口径）。对照页 `button-checkbox-compare` 的 ButtonGroup 区块可见两侧差异。
- **SelectFileInputWidget 的初始文件集可用 `value`/`defaultValue` 声明**。原版构造期传 `value` 会被丢弃：彼时 `$input` 尚未置 `type=file`，`setValue` 写回 `input.files` 无效，而构造末尾又用 `$input.files` 覆盖了 `currentFiles`（实测 `new SelectFileInputWidget({value:[file]})` 后 `currentFiles`/`input.files` 均为空、`oo-ui-selectFileInputWidget-empty` 未摘除），原版只能构造后调 `setValue`。React 版按受控惯例直接生效，并把文件集写回 DOM `input.files`（经 `DataTransfer`），表单提交正常。
- **ButtonInput 的 title 落真实 button/input 并支持 invisibleLabel 兜底**。原版 `ButtonInputWidget` 不混入 `TitledElement`（mixin 清单仅 Button/Icon/Indicator/Label/FlaggedElement 五个 Element），`title` 本无落点；React 版把 `title` 接入 `resolveTitle` 落在真实 `button`/`input` 上（invisibleLabel 时以标签兜底、accessKey 附加键位后缀），与其余按钮形态（Button/ButtonOption）的 tooltip 行为看齐。

### 等效替代

原版行为本工程也具备，只是实现形态、落点或通道不同（含已对齐项的对应关系留档），效果等价，无需补做。

- **`TabIndexedElement` 的 `setTabIndex(null)` 语义不做，改用 `-1` 等效**。原版传 `null` 时移除该元素的 `tabindex` 与 `aria-disabled`；React 的 `tabIndex` 类型不接受 `null`，经 `...rest` 透传到 DOM 会破坏属性类型，故统一收为 `number`——需要"不参与Tab序"时用 `-1`（焦点可达性等价）。其余 tabIndex 行为已对齐：`disabled` 覆盖显式值、落点与原版 `$tabIndexed` 一致（Button→锚点、输入类→`input`、Dropdown→handle、ToggleSwitch/RadioSelect/TabSelect→根）、`aria-disabled` 写在该元素上。
- **ActionFieldLayout 用 `fieldInline` prop 声明输入区包装元素**（默认 `div`）。原版靠字段控件根元素的 tagName 自动判断 span/div，React 无法探测子组件的元素类型。
- **FieldLayout 的 `align='inline'` 降级校验同理不需要**（与上一条同源）。原版在字段非内联时把 `align='inline'` 降级为 `'top'`；React 版由调用方经 `fieldInline` 显式声明是否内联，无需运行时探测降级。
- **Popup 的自动翻转判定改按预计算的两侧空间比较**（原版先定位再测量）：判定时机不同，翻转结果目标一致。
- **菜单类与工具栏类浮层经 portal 至 body 定位**（原版 `FloatableElement` 基于 offsetParent 相对定位并计入 RTL 方向；工具组面板与弹出工具浮层原版挂 `toolbar.$popups`）：React 版一律用页面坐标定位，RTL 起始边对齐已对齐。`$overlay` 配置已由 `OOUIProvider.getPortalContainer` 承接，不再是差异。
- **`ToolGroupTool` 的内嵌工具组以 React 元素给出**（`ToolProps.group`，如 `<ListToolGroup/>`），原版经 `groupConfig`+`ToolGroupFactory` 创建 list 组：工具组再嵌工具组的递归由组件树承担，无需工厂注册；内嵌组的开合由它自己的把手承担（原版 `ToolGroupTool.onSelect` 因 `$link.remove()` 后 `findTargetTool` 只认 `.oo-ui-tool-link` 而不可达，等价）。工具位因此不再有链接，`title`/`icon`/`active`/`onSelect` 对 `group` 工具不生效（原版 `$link.remove()` 同样使前三者无效），只保留 `disabled`（同步为工具位的禁用态，且按原版不下发给内嵌组）。
- **ComboBoxInput 的菜单展开时机是等效实现**：原版 `onEdit` 监听多种事件后再 toggle。
- **SearchWidget 的结果列表带 `tabindex="-1"`**（原版该元素无 `tabindex` 属性）：不可Tab聚焦的效果一致（同上方 `setTabIndex` 条），差别仅在 `-1` 元素可被编程聚焦。焦点归属已对齐：`aria-activedescendant` 经 `Select` 的 `focusOwnerRef`（对齐原版 `results.setFocusOwner(query.$input)`）落在查询框上、列表根不再输出；点击结果两侧都不改变焦点。
- **Dialog 焦点陷阱的已对齐部分**（对应关系留档）：Tab 闭环（focusTrap 类 + focus 重定向 + content `tabIndex=-1`）、`role='dialog'` 挂载在 `.oo-ui-window` 根、关闭 teardown 后归还打开前的焦点（对应原版 `WindowManager.$returnFocusTo`）；带标题的 `ProcessDialog`/`MessageDialog` 已用 `aria-labelledby` 关联标题（对应原版 `Dialog.initialize` 的 `title.getElementId()`）。
- **Dialog 的滚动锁经 scrollLock 模块登记实现**（对应关系留档）：原版 `WindowManager.toggleGlobalEvents` 在 body data 上维护 `windowManagerGlobalEvents` 栈并给 body/html 加 `oo-ui-windowManager-modal-active`（body `overflow: hidden`、html 非满屏 `scrollbar-gutter: stable`，类规则由主题 CSS 承接）；React 版每个 Dialog 自带 manager、无共享容器承载该栈，改为模块级登记表（`src/dialogs/scrollLock.ts`）按打开周期（`open||active`，对应原版 openWindow 上锁、teardown 完成解锁）计数。`modal-active-fullscreen` 变体取 Dialog 的 `full` 实态，与原版 `getSize() === 'full'` 等价——原版 `getSize()` 同样含窄屏视口判定（视口宽不足档位宽即返回 `'full'`）。
- **裸 `Dialog` 无内置标题**：调用方自行渲染标题并以 `aria-labelledby` 关联（`MessageDialog`/`ProcessDialog` 的内置标题已含该关联）。
- **工具栏窄栏类在浮层内的承接位置**：原版把 `oo-ui-toolbar-narrow` 加在工具栏根与 `$popups` 容器上（工具组面板与弹出工具浮层都在其中，主题的窄栏规则均为后代选择器）；本工程浮层 portal 至 body 后失去该祖先，工具组面板经一层窄栏载体 div 承接、弹出工具浮层则把该类落在浮层根上。承载元素不同，但"浮层内容存在含窄栏类的祖先"这一前提两侧一致（对照以祖先判定为断言）。
- **SelectFileInputWidget 的选择按钮根元素是`<span>`而非原版的`<label>`**：原版把按钮根换成`<label>`借原生关联内含的 file input；本工程沿用 Button 一律`<span>`（内层`<a class="oo-ui-buttonElement-button">`）的约定，点击开选择器由主题 CSS 的文件input覆盖层承担——实测按钮中心的最上层元素两侧同为`input[type=file]`，行为一致。
- **Dropdown 的 `title` 落在根元素**（原版 `DropdownWidget` 的 `$titled` 为内部 `$label`）。tooltip 位于控件子树内、可视结果一致，仅 DOM 落点不同。其余混入 TitledElement 的组件已按原版落点接入（见 comparison-guide.md「共享抽象」的 `resolveTitle` 条目）。
- **Message 的 `notice` 类型不输出 `oo-ui-image-notice`**：原版按类型给图标加 `oo-ui-image-{type}`，本工程经 `imageVariantClasses` 只输出主题存在的 image 变体位（notice 不在其中）。两个主题 CSS 均无该类规则，视觉等价。
- **`aria-required` 是原版 DOM 之外的附加属性**：原版 `RequiredElement` 只写原生 `required`，本工程同时输出 `aria-required`（对原生 input 而言冗余但无害，不改变 AT 播报）。保留以不改变既有 a11y 输出。
- **`resolveTitle` 的兜底随 props 重渲染重算**：原版 TitledElement 的「invisibleLabel → title」兜底只在构造期求值（后续 `setLabel`/`setInvisibleLabel` 不重算 title），React 版每次渲染按当前 props 计算，label 后续变化会联动 title——声明式求值时机的固有差异，兜底能力本身两侧一致。

### 暂未实现

原版有、本工程也认可其价值，但当前没做（含只做了简化版）。

- **Popup 的容器钳制是简化版**：原版会按 `$container`（默认就近滚动容器）和 `containerPadding` 把弹层钳制在容器内；React 版只向上找第一个 `overflow: auto/scroll` 祖先，未完整复刻 `getClosestScrollableElementContainer`。
- **工具栏的以下能力未实现**：
  - PopupToolGroup：面板 portal 至 body 后按视口口径定位、固定起始边对齐（LTR左/RTL右，经 `useAnchoredPanelLayout` 与 MenuSelect 共用实现）；原版 `FloatableElement` 会按左右空间选择对齐侧、空间不足时填充容器，这部分未实现。窄栏类已按原版 `setNarrow` 下发到面板的窄栏载体。
  - **弹出工具置于 List/Menu 组内不可用**（原版同样不可用，故不修）：选中工具会先收起组面板，浮层锚点随面板 `display:none` 归零。实测原版侧工具转激活态但浮层不显示（`hideWhenOutOfView` 判定），React 侧浮层弹出但定位到视口左上角。
- **`confirm`/`alert`/`prompt` 是简化实现**：原版经全局单例 WindowManager 异步开关窗口（`openWindow`/`closeWindow` 返回 Promise），React 版各弹窗独立挂载、无同一管理器的开窗队列（重复调用会层叠而非替换前一个）；ESC/焦点陷阱绑定在弹窗自身，多层层叠时天然只有顶层响应。
- **MessageDialog/ProcessDialog 的移动端与 RTL 适配分支未实现**：原版 `fitActions`/`fitLabel` 在移动端（`oo-ui-isMobile`）与 RTL 下有独立的空间分配布局；React 版已按原版构造函数下发 `oo-ui-isMobile` 类（`OOUIProvider.isMobile`），适配布局本身未实现。
- **Dialog 的 `toggleIsolation` 未实现**：原版会给兄弟节点加 `inert`/`aria-hidden` 做隔离。本工程浮层默认 portal 至 body，一刀切隔离会误伤弹窗内的浮层（导致无法交互）；`OOUIProvider.getPortalContainer` 已支持把浮层指入弹窗容器（豁免通道），实现隔离时还需按浮层的 portal 归属判定豁免，故仍未做。
- **TitledElement 的修饰键文案未接**：原版 `formatTitleWithAccessKey` 优先取 `jquery.accessKeyLabel` 的 `getAccessKeyLabel`（MediaWiki 侧显示“Alt+Shift+k”一类本地化组合键），纯 DOM 环境不可得；本工程按原版的回落分支只输出原键值（`title [k]`）。需要时可由宿主提供等价的标签解析通道接入 `resolveTitle`。
- **CheckboxMultiselect 未渲染原版 `MultiselectWidget` 的 `$group` 容器**：原版在根元素内还有一层 `.oo-ui-multiselectWidget-group`，选项是该容器的子节点；本工程选项直接作为根元素的子节点（根元素类已对齐 `oo-ui-multiselectWidget`）。站点若按原版结构写 `.oo-ui-multiselectWidget-group` 选择器不会命中。
- **Popup 未开放 `icon`**：原版 `PopupWidget` 混入 IconElement，`config.icon` 会在浮层头部渲染图标（根元素随之输出 `oo-ui-iconElement`）；本工程 Popup 未提供该 prop。
- **选项族选中/按压态的图标自动着色未实现**：原版 wikimediaui 主题 `getElementClasses` 对选中或按压的 MenuOptionWidget/OutlineOptionWidget 自动给图标加 `oo-ui-image-progressive`（不依赖 flags 配置）；本工程除 ButtonOption 按"激活/禁用反色"规则输出变体外，其余选项形态的图标无自动着色。
- **FieldLayout 的 title 缺字段控件 accessKey 委托**：原版 FieldLayout 构造末尾经覆写的 `formatTitleWithAccessKey` 委托字段控件，label 的 tooltip 会附上字段 accessKey（`Title [k]`）；React 版 FieldLayout 拿不到字段控件的 accessKey，title 为纯文本（title/accessKey 同传的组件已由 `resolveTitle` 覆盖键位后缀）。
