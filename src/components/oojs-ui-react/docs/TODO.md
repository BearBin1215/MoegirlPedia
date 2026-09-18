## 未对齐行为记录

与原版 oojs-ui 的差异记录。每条记一处差异，写法统一为：原版怎么做、本工程怎么做、为什么。

按性质分四节：

- **舍弃**：有意不做。原版的行为对本工程没有使用场景，或者本工程有意换一种做法。
- **增强**：有意多做。原版没有、本工程主动加上的能力，也包括修正原版缺陷。
- **等效替代**：能力两边都有，只是实现形态、落点或通道不同，效果等价，不需要补做。
- **暂未实现**：原版有、本工程也认可其价值，但当前没做（含只做了简化版）。这一节最终应当清空。

四个标签的边界：能力一样作数、只是形态不同归「等效替代」；能力不作数归「舍弃」；有缺口归「暂未实现」。

### 舍弃

- **TabOption 不支持 `href` 链接**。原版这个能力只有 PHP 端在用，本工程暂无需求。
- **`OO.ui.HtmlSnippet` 不映射**。原版用这个包装类把字符串标记为「原样输出、不转义」。React 的 `ReactNode` 本身就能表达 HTML 片段，不需要包装层。
- **`OO.ui.Theme` 不映射为运行时对象**。原版的主题 JS 类提供 `getElementClasses` 等钩子。本工程把类名生成收敛到 `src/mixins.ts` 的各贡献器（每个对应原版一个 Element mixin），主题样式仍由站点 CSS 提供，不设可替换的主题实例。
- **prompt 的 `textInput.value` 只作为初始值**。弹窗存活期间无法从外部修改输入值，输入内容由 prompt 内部维护。这与原版语义一致：原版 `TextInputWidget` 的 `value` 配置同样只在构造时生效。
- **Message 的关闭按钮只回调 `onClose`，不自行隐藏**。显隐交由调用方控制，对齐 React 受控惯例；原版 `toggle(false)` 会内置隐藏。
- **工具栏不再经 `ToolFactory` 注册工具**。改为 ToolGroup 的声明式 `tools` props，工具激活态由调用方受控。原版对应的是 `tool.setActive` 加 toolbar 的 `updateState` 事件。
- **内嵌工具组（`ToolProps.group`）的工具位不输出图标与标签类**。原版这两个类确实加在工具根元素上（构造期的 `IconElement.setIcon`/`Tool.setIcon`），但主题里依赖它们的规则全部以 `.oo-ui-tool-link` 为后代选择器，而这个链接已被 `ToolGroupTool` 移除（`this.$link.remove()`），类没有生效规则。本工程干脆不输出。
- **工具栏与工具组无事件面**。原版 `Toolbar` 与 `ToolGroup` 都有事件（`updateState`/`active`/`disable` 等）。其中 `PopupTool.onPopupToggle` 与 `ToolGroupTool` 会经工具组的 `active` 事件冒泡到 `Toolbar.active`，MediaWiki 侧常用它保持工具栏可见。本工程全部改为受控 props 与回调，不移植事件系统。
- **未实现工具级快捷键提示**。原版 OOUI 本身也没有快捷键系统，`getToolAccelerator` 只是留给宿主覆写的钩子。
- **ProcessDialog 用 `onAction` 异步回调编排动作**。替代原版 `getActionProcess` 的 `OO.ui.Process` 多步 `.next()` 链。多步流程在同一个异步函数内串联，因此不可中断（原版可以 abort）。
- **不提供 `ActionSet.static.specialFlags` 的子类扩展点**。原版允许子类改写这个静态属性来扩充「特殊动作」标志（缺省 `safe`/`primary`，命中者被安置到头部的 safe/primary 位）。本工程没有类继承，`ProcessDialog` 的特殊标志固定为 `safe`/`primary`，调用方经 `flags` 声明这两个即可。
- **原版 `OO.ui` 命名空间中宿主环境性质的全局工具不映射**。具体是：
  - `bind`（jQuery proxy）
  - `infuse`（PHP 服务端渲染水合）
  - `warnDeprecation`
  - `getUserLanguages`/`getLocalValue`（MediaWiki 多语言回退）
  - `EventSequencer`（底层事件时序，React 事件系统没有使用场景）
  - `generateElementId`（React `useId` 已覆盖）

  `debounce`/`throttle` 也不进导出面，组件内部直接用 es-toolkit。
- **`isSafeUrl` 不映射，`href`/`action` 不做安全 URL 净化**。原版 `OO.ui.isSafeUrl` 有两个消费点：`ButtonWidget.setHref` 与 `FormLayout` 构造，对判定为不安全的 URL 加 `./` 前缀。本工程 `Button` 的 `href` 与 `FormLayout` 的 `action` 都直传、不净化（见各组件的 props 注释），由调用方保证 URL 安全。这与 `TabOption` 的 `href` 无关，后者的 `href` 能力本身已舍弃。
- **Popup 在滚动引起裁剪变化时仍会重新判定翻转方向**。原版 `FloatableElement` 的注释明确写了「滚动时不再翻转」，本工程有意保留重判定。
- **CheckboxMultioption 的根元素用 `role='checkbox'` 加 `aria-checked`**，内层是原生 checkbox。原版 `OptionWidget` 的根是 `role='option'`（由 `SelectWidget` 的 `listbox` 承载）。本工程若改成 `option`，会与内层原生控件的语义重复，故保留 checkbox 语义。
- **Select 系选项的选中态统一用基类 `OptionProps.selected`**，Radio 与 Checkbox 型选项在内层原生控件上再映射为 `checked`。原版各 OptionWidget 分别用 `setSelected`/`setChecked` 等维护；本工程认为选中语义相同，不对外暴露多种命名。
- **布局组件的受控 API 统一为 `value`/`defaultValue`/`onChange`**（`StackLayout`、`IndexLayout`、`BookletLayout`）。原版经 `setItem`/`setPage`/`setTabPanel` 等 setter 命令式切换。
- **选项族不支持 `flags`**。原版 `OptionWidget` 混入 `FlaggedElement`，选项可经 `flags` 输出 `oo-ui-flaggedElement-*` 并影响图标变体（progressive/destructive/error/warning/success）。本工程的选项族（MenuOption、OutlineOption、TabOption、ButtonOption 等）未开放该配置，`ButtonOption` 的图标与指示器变体只按「带边框且激活或禁用则反色」输出。
- **TagMultiselect 的 `value`/`onChange` 包含非法标签**。原版 `getValue()` 只返回合法标签（`items.filter(item => item.isValid())`），非法标签仅展示、不进值。本工程的 `value` 就是标签集合本身（含非法项），以适应受控语义：若按原版过滤，受控父级回写时会丢失非法标签，显示项与值就对不上了。
- **未实现 `PopupTagMultiselectWidget`**。原版该类构造期就 `warnDeprecation`（建议改用 `MenuTagMultiselectWidget`），本工程不提供。
- **标签数据限于 `string | number`**。原版标签 data 可以是任意对象（`{data,label}` 形态）。本工程与选择族保持一致，值统一为 `string | number`，标签文本取自菜单选项的 `label` 或值本身。
- **TagMultiselect 不开放替换内部输入控件**。原版 `config.input`/`config.inputWidget` 可以替换内部输入控件；本工程内置输入框，对齐其余组件不暴露内部输入控件的做法。
- **弹窗滚动锁不含 iOS 触摸滚动 hack**。原版 `togglePreventIosScrolling` 针对 iOS Safari 无视 `body { overflow: hidden }` 的问题：仅在 iOS 设备且打开 full 尺寸弹窗时保存与恢复滚动位置，并加 `oo-ui-windowManager-ios-modal-ready` 类。触发条件窄，还要移动滚动位置，成本与收益不对等，本工程不实现。
- **`label` 的有效性真值与原版不同**。原版 `LabelElement.setLabel` 只认非空字符串（数字、布尔一律归为无标签）。本工程的 `hasLabel` 把 `0`/`true` 这类可渲染的 ReactNode 视为有标签（JSX 确实会渲染出内容），并相应输出 `oo-ui-labelElement` 与标签内容。
- **多行输入框不提供 `allowLinebreaks` 配置与 `enter` 事件**。原版 `MultilineTextInputWidget` 可经该配置（缺省 `true`）退化成「假装单行」形态：阻止 Enter 换行、`cleanUpValue` 把换行替换为空格，并把 Ctrl/Cmd+Enter 改作 `enter` 事件。本工程恒等价于 `allowLinebreaks=true`（Enter 插入换行），Ctrl/Cmd+Enter 没有事件通道。需要禁止换行时由调用方自行清洗输入值；`enter` 事件也没有使用场景（`prompt` 的单行输入框已自行处理 Enter 提交）。对照页 `multiline-compare` 的「换行与Enter」区块可见差异。

### 增强

- **`isMobile` 由恒 `false` 的桩映射为可配置项**。原版 `OO.ui.isMobile` 的默认实现恒返回 `false`（源码注释就写着「由实现方决定」），dist 里也没有任何组件把它覆盖成真值，所以原版所有移动端分支在纯 OOUI 环境下都不可达。本工程把它映射为 `OOUIProvider.isMobile`（`useIsMobile`），配置为真后这些分支就生效。目前已实现四处：`TabSelect` 里 `TabOption` 选中后居中滚动、`IndexLayout` 与 `BookletLayout` 的 autoFocus 抑制、`ProcessDialog` 的 `oo-ui-isMobile` 类、`ProcessDialog.fitLabel` 的「移动端不居中」。还没做的部分见「暂未实现」。
- **视口留白缺省收紧为每边 5px**。原版 `OO.ui.getViewportSpacing()` 缺省返回四边 0；本工程 `VIEWPORT_SPACING` 缺省 5px（可经 `viewportSpacing` 配置覆盖），浮层贴边时留出可视间隙。
- **`RadioSelectInput` 采纳 `options[].disabled`**。原版 `RadioSelectInputWidget.setOptionsData` 构造 `RadioOptionWidget` 时只转发 `data` 与 `label`，`opt.disabled` 被静默丢弃。同一份选项配置下，`CheckboxMultiselectInputWidget`（显式转发 `disabled`）与 `DropdownInputWidget`（`opt.disabled !== undefined` 即 `setDisabled`）都会禁用该项，只有 Radio 型渲染为可用项。本工程按声明采纳 `disabled`，与另两个 Input 包装组件的口径一致。
- **TabSelect 修掉了原版拖拽的一个缺陷**。原版的 `selecting` 在丢失 mouseup 后（例如按住鼠标拖出窗口再松开）会残留，下次点击空白处就会误提交旧选项。本工程在 mousedown 时重置拖拽状态，并监听 `pointercancel` 清理。（按住拖动跨选项选择原版已实现，未改动。）
- **工具栏面板支持按 Escape 收起**。原版只能靠鼠标或键盘在面板外松开时收起，没有 Escape 键。
- **弹出工具（`ToolProps.popup`）的 `onSelect` 仍会触发**。原版 `PopupTool.onSelect` 被 `popup.toggle()` 占用，调用方拿不到选中通知。本工程按压流照常回调 `onSelect`，浮层开合由工具自身的点击与按键驱动，显隐变化另经 `popup.onOpenChange` 通知。
- **弹出工具的 `autoFlip` 可配置**。原版构造期无条件 `setAutoFlip(false)`，`config.popup.autoFlip` 传了也不生效。本工程默认同样是 `false`（对齐原版），但允许调用方显式打开翻转。
- **BookletLayout 在激活页签被移除时自动补选相邻页签**。非受控直接生效，受控则由父组件决定是否采纳。原版不补选，其 `removePages` 注释明确表示「选哪页属业务逻辑」。
- **ProgressBar 把 `progress` 钳制在 0–100**，非有限值（NaN 等）按不定进度处理。原版 `setProgress` 不钳制，NaN 会直接输出 `width: NaN%` 和 `aria-valuenow="NaN"`。
- **Select 根元素可聚焦，FieldLayout 标签点击会聚焦根**。原版 `SelectWidget` 没有 `TabIndexedElement`（根不可聚焦），`simulateLabelClick` 继承基类的空操作，所以标签点击没有任何效果。本工程为 listbox 的键盘可达性给根加了 `tabIndex`，标签点击随之聚焦根（与 RadioSelect 行为一致）。
- **ButtonSelect 的 `aria-activedescendant` 在初始选中时即输出**。原版 `SelectWidget.selectItem` 只在选中项变化时写入该属性，所以带初始选中值的控件首帧没有这个属性。本工程按声明式状态始终输出选中项 id。
- **CopyTextLayout 的复制优先走 `navigator.clipboard`**，不可用或被权限拒绝时回落到原版用的 `document.execCommand('copy')`。原版只用后者，该 API 已废弃，在非安全上下文或部分浏览器中会静默失败，且无从感知。
- **HiddenInputWidget 的 `disabled` 落到原生属性上**。原版经 `Widget.setDisabled` 只切换 `oo-ui-widget-*` 类并移除 `aria-disabled`，被「禁用」的隐藏输入仍会随表单提交。本工程按标准 `disabled` 语义让它退出提交。
- **ButtonOption 的选中态图标与指示器一律反色**。原版 `ButtonOptionWidget` 构造期 `setSelected` 会 `setActive(true)`，但随后 `ButtonElement` 构造函数把 `this.active` 复位为 `false`，于是「初始选中」的按钮不反色、「用户点选后」的按钮才反色，同一状态两种表现（实测确认）。本工程按主题规则统一输出：带边框按钮在激活或禁用时反色。
- **Button 系列不输出 `oo-ui-buttonElement-size-medium`**。原版 `ButtonElement.setSize` 缺省会写入尺寸类（`medium`），而该类在 wikimediaui 与 apex 两个主题的 CSS 里都没有定义、不产生样式。本工程的 Button/ButtonInput/ButtonOption 一律不输出。
- **固定标签不可拖拽，且非固定标签不得被拖到固定标签之前**。原版虽然在 `TagItemWidget` 上实现了 `fixed`（不渲染关闭按钮、不可移除与编辑），但标签多选族没有开放这个配置的入口（`MenuTagMultiselectWidget.createTagItemWidget` 不传 `fixed`），所以实际不可达，标签恒可拖可移除。本工程在 `TagOptionProps` 上开放 `fixed`，并让拖拽的目标下标钳制在固定区之后，固定项的顺序不受拖拽影响。
- **ButtonMenuSelectWidget 的 `aria-owns` 常驻，键盘展开同样输出按压态**。原版构造期写入的 `aria-owns` 会被菜单关闭时的 `MenuSelectWidget.onToggle`（`removeAttr('aria-owns')`）一并清掉，此后触发器不再声明所拥有的菜单；键盘展开的按压态也会被随后的 keyup 复位流清掉（鼠标展开则有按压态，同一状态两种表现）。本工程按声明式状态输出：`aria-owns` 常驻，`oo-ui-buttonElement-pressed` 恒随打开态。
- **ButtonMenuSelectWidget 支持方向键展开**（收起时 ↑/↓ 即展开）。原版只有 Enter 与空格能展开（ButtonWidget 没有方向键处理，菜单未展开时也不监听 document 键盘），方向键只在展开后由菜单接管。本工程与 Dropdown 行为一致：收起时 ↑/↓ 展开，展开后 ↑/↓ 移动高亮。
- **ButtonMenuSelectWidget 的键盘手势去重，选定与展开后不因 keypress 激活通道重新切换**。原版按键流里菜单的 document keydown 处理器虽对已消费按键 `preventDefault`，Chrome 仍会派发 keypress，`ButtonElement.onKeyPress` 的 click 模拟随即再次 `menu.toggle()`，于是键盘选定或展开后菜单会被重新开合（同一手势切换两次）。本工程用手势标记跳过同一次手势内 keypress 经 Button 键盘激活通道的重复切换（keyup 复位，抑制 keypress 的浏览器也不受影响）。
- **ButtonMenuSelectWidget 与 Dropdown 展开后空格可选定**。原版展开态按空格不被菜单消费（`MenuSelectWidget.onDocumentKeyDown` 没有 SPACE 分支），keypress 照发，经 `ButtonElement.onKeyPress` 的 click 模拟只关闭菜单。本工程空格与 Enter 同分支，直接选定高亮项（与按钮空格激活的 ARIA 惯例一致，Dropdown 同）。
- **PopupToolGroup 的 title 按窄栏生效值兜底**。原版 TitledElement 的「invisibleLabel → title」兜底只在构造期求值，而窄栏切换（`onToolbarResize` 只改写 invisibleLabel、label、icon）不会重算 title，所以原版窄栏把手下没有 tooltip。本工程按窄栏生效的 `invisibleLabel`/`label` 计算，窄栏下仍有 tooltip。未设置 invisibleLabel 时两侧一致。
- **ButtonGroup 的组禁用下发给组内按钮**。原版 `ButtonGroupWidget` 没有覆写 `setDisabled`，只给组根切换 `oo-ui-widget-disabled`/`-enabled`，组内按钮仍是 enabled（图标与指示器也因此不反色）。本工程经 Context 把组禁用与按钮自身 disabled 取或，组内按钮输出 disabled 态，按压与点击都被拦截，对齐本工程「组禁用即各项禁用」的一贯口径。对照页 `button-checkbox-compare` 的 ButtonGroup 区块可见两侧差异。
- **SelectFileInputWidget 的初始文件集可用 `value`/`defaultValue` 声明**。原版构造期传 `value` 会被丢弃：那时 `$input` 还没置 `type=file`，`setValue` 写回 `input.files` 无效，而构造末尾又用 `$input.files` 覆盖了 `currentFiles`（实测 `new SelectFileInputWidget({value:[file]})` 之后 `currentFiles` 与 `input.files` 都是空、`oo-ui-selectFileInputWidget-empty` 未摘除），原版只能构造后再调 `setValue`。本工程按受控惯例直接生效，并把文件集写回 DOM 的 `input.files`（经 `DataTransfer`），表单提交正常。
- **ButtonInput 的 title 落真实 button/input 并支持 invisibleLabel 兜底**。原版 `ButtonInputWidget` 不混入 `TitledElement`（mixin 清单只有 Button、Icon、Indicator、Label、FlaggedElement 五个 Element），`title` 本来没有落点。本工程把 `title` 接入 `resolveTitle`，落在真实 `button`/`input` 上（invisibleLabel 时以标签兜底、accessKey 附加键位后缀），与其余按钮形态（Button、ButtonOption）的 tooltip 行为看齐。
- **多行输入框 autosize 的重测时机含盒模型与宽度变化兜底**。原版 `adjustSize` 只由 change 事件驱动，标签宽度变化、字体加载、窗口缩放后都不重算，高度滞留到下一次输入。本工程在值或行数变化时同步重测之外，再用 ResizeObserver 观察输入框尺寸兜底重测，首帧测量早于标签让位内边距生效的问题也因此消除。
- **滚动条让位的偏移侧按输入元素自身方向判定**。原版 `adjustSize` 的 scrollWidth 分支读的是**根元素**的 `css('direction')`，而 `dir` 配置经 `InputWidget.setDir` 只落在 `$input` 上。于是 LTR 页面显式 `dir='rtl'` 时原版让位到 `right`，但 RTL 输入框的垂直滚动条实际在左侧。本工程读输入元素自身的有效方向，让位侧与滚动条物理位置一致。未显式传 `dir` 时两侧一致（都继承页面方向）。

### 等效替代

能力两边都有，只是实现形态、落点或通道不同，效果等价，不需要补做。这一节也兼作已对齐项的对应关系留档。

- **`TabIndexedElement` 的 `setTabIndex(null)` 语义不做，改用 `-1` 等效**。原版传 `null` 时移除该元素的 `tabindex` 与 `aria-disabled`；React 的 `tabIndex` 类型不接受 `null`，经 `...rest` 透传到 DOM 会破坏属性类型，故统一收为 `number`，需要「不参与 Tab 序」时用 `-1`（焦点可达性等价）。其余 tabIndex 行为已对齐：`disabled` 覆盖显式值；落点与原版 `$tabIndexed` 一致（Button 到锚点、输入类到 `input`、Dropdown 到 handle、ToggleSwitch/RadioSelect/TabSelect 到根）；`aria-disabled` 写在该元素上。
- **ActionFieldLayout 用 `fieldInline` prop 声明输入区包装元素**（默认 `div`）。原版靠字段控件根元素的 tagName 自动判断 span 与 div，React 无法探测子组件的元素类型。
- **FieldLayout 的 `align='inline'` 降级校验同理不需要**（与上一条同源）。原版在字段非内联时把 `align='inline'` 降级为 `'top'`；本工程由调用方经 `fieldInline` 显式声明是否内联，不需要运行时探测降级。
- **Popup 的自动翻转判定改按预计算的两侧空间比较**，原版是先定位再测量。判定时机不同，翻转结果目标一致。
- **菜单类与工具栏类浮层经 portal 至 body 定位**。原版 `FloatableElement` 基于 offsetParent 相对定位并计入 RTL 方向，工具组面板与弹出工具浮层原版挂在 `toolbar.$popups` 上。本工程一律用页面坐标定位，RTL 起始边对齐已对齐。`$overlay` 配置已由 `OOUIProvider.getPortalContainer` 承接，不再是差异。
- **`ToolGroupTool` 的内嵌工具组以 React 元素给出**（`ToolProps.group`，如 `<ListToolGroup/>`），原版经 `groupConfig` 加 `ToolGroupFactory` 创建 list 组。工具组再嵌工具组的递归由组件树承担，不需要工厂注册；内嵌组的开合由它自己的把手承担（原版 `ToolGroupTool.onSelect` 因 `$link.remove()` 后 `findTargetTool` 只认 `.oo-ui-tool-link` 而不可达，等价）。工具位因此不再有链接，`title`/`icon`/`active`/`onSelect` 对 `group` 工具不生效（原版 `$link.remove()` 同样使前三者无效），只保留 `disabled`（同步为工具位的禁用态，且按原版不下发给内嵌组）。
- **ComboBoxInput 的菜单展开时机是等效实现**。原版 `onEdit` 监听多种事件后再 toggle。
- **`OO.ui.ActionWidget`/`OO.ui.ActionSet`/`OO.ui.Error` 的能力内联在 `ProcessDialog`**。原版这三个类只服务 Dialog 体系：`ActionWidget` 是带 `action`/`modes` 的按钮，`ActionSet` 管 special 与 others 的分类以及 `setMode`/`setAbilities`，`OO.ui.Error` 描述可恢复性、警告与消息。本工程不提供独立类，改由 `ProcessDialog` 的 `actions` 数组承接：`ProcessDialogActionProps` 对应 `ActionWidget` 的 `action`/`label`/`flags`/`modes`/`disabled`/`pending`/`title`（渲染为 `Button` 加 `oo-ui-actionWidget` 类，`pending` 即其 PendingElement 能力），`visibleActions`/`safeAction`/`primaryAction`/`otherActions`/`disabledAction` 等价于 `organize`/`setMode`/`setAbilities`，错误收为错误对象类型由错误面板渲染。
- **`OO.ui.OutlineControlsWidget` 的能力内联在 `BookletLayout`**。原版该类自述「目前只被 BookletLayout 使用」。本工程把三个移动按钮与 items 槽位内联在 outline 面板内，`oo-ui-outlineControlsWidget`/`-items`/`-movers` 三层类名与按钮禁用规则（原版 `onOutlineChange`）均已对齐，`outlineControlsExtra` 对应原版 GroupElement 的 `$group`。原版构造该控件时不传 `abilities`（BookletLayout 恒为 move 与 remove 全开），所以本工程不另设这个整体开关，按钮可用性按各选项自身的 `movable`/`removable` 逐项判定。
- **SearchWidget 的结果列表带 `tabindex="-1"`**，原版该元素没有 `tabindex` 属性。不可 Tab 聚焦的效果一致（同上方 `setTabIndex` 条），差别只在 `-1` 元素可被编程聚焦。焦点归属已对齐：`aria-activedescendant` 经 `Select` 的 `focusOwnerRef`（对齐原版 `results.setFocusOwner(query.$input)`）落在查询框上，列表根不再输出；点击结果两侧都不改变焦点。
- **Dialog 焦点陷阱的已对齐部分**。Tab 闭环（focusTrap 类、focus 重定向、content `tabIndex=-1`）；`role='dialog'` 挂在 `.oo-ui-window` 根；关闭 teardown 后归还打开前的焦点（对应原版 `WindowManager.$returnFocusTo`）。带标题的 `ProcessDialog` 与 `MessageDialog` 已用 `aria-labelledby` 关联标题（对应原版 `Dialog.initialize` 的 `title.getElementId()`）。
- **Dialog 的滚动锁经 scrollLock 模块登记实现**。原版 `WindowManager.toggleGlobalEvents` 在 body data 上维护 `windowManagerGlobalEvents` 栈，并给 body 与 html 加 `oo-ui-windowManager-modal-active`（body `overflow: hidden`、html 非满屏 `scrollbar-gutter: stable`，类规则由主题 CSS 承接）。本工程每个 Dialog 自带 manager，没有共享容器承载这个栈，改为模块级登记表（`src/dialogs/scrollLock.ts`）按打开周期计数（`open || active`，对应原版 openWindow 上锁、teardown 完成解锁）。`modal-active-fullscreen` 变体取 Dialog 的 `full` 实态，与原版 `getSize() === 'full'` 等价，原版 `getSize()` 同样含窄屏视口判定（视口宽不足档位宽即返回 `'full'`）。
- **裸 `Dialog` 无内置标题**。调用方自行渲染标题并以 `aria-labelledby` 关联（`MessageDialog` 与 `ProcessDialog` 的内置标题已含该关联）。
- **工具栏窄栏类在浮层内的承接位置**。原版把 `oo-ui-toolbar-narrow` 加在工具栏根与 `$popups` 容器上（工具组面板与弹出工具浮层都在其中，主题的窄栏规则均为后代选择器）。本工程浮层 portal 至 body 后失去了这个祖先，工具组面板经一层窄栏载体 div 承接，弹出工具浮层则把该类落在浮层根上。承载元素不同，但「浮层内容存在含窄栏类的祖先」这一前提两侧一致（对照以祖先判定为断言）。
- **SelectFileInputWidget 的选择按钮根元素是 `<span>` 而非原版的 `<label>`**。原版把按钮根换成 `<label>`，借原生关联内含 file input。本工程沿用 Button 一律 `<span>`（内层 `<a class="oo-ui-buttonElement-button">`）的约定，点击开选择器由主题 CSS 的 file input 覆盖层承担；实测按钮中心的最上层元素两侧同为 `input[type=file]`，行为一致。
- **Dropdown 的 `title` 落在根元素**，原版 `DropdownWidget` 的 `$titled` 是内部的 `$label`。tooltip 位于控件子树内、可视结果一致，只是 DOM 落点不同。其余混入 TitledElement 的组件已按原版落点接入（见 comparison-guide.md「共享抽象」的 `resolveTitle` 条目）。
- **Message 的 `notice` 类型不输出 `oo-ui-image-notice`**。原版按类型给图标加 `oo-ui-image-{type}`，本工程经 `imageVariantClasses` 只输出主题里存在的 image 变体位（notice 不在其中）。两个主题的 CSS 都没有该类规则，视觉等价。
- **`aria-required` 是原版 DOM 之外的附加属性**。原版 `RequiredElement` 只写原生 `required`，本工程同时输出 `aria-required`（对原生 input 而言冗余但无害，不改变 AT 播报）。保留它是为了不改变既有的 a11y 输出。
- **NumberInput 的 `allowInteger`/`isInteger` 一并收，等价于强制 `step=1`**。原版二者都是已废弃的兼容配置（`isInteger` 是 `allowInteger` 的别名），置位时覆盖显式 `step`。本工程同样支持这两个写法，也不额外告警。这里没有按 React 惯例另设现代命名（如 `integerOnly`）：它们是原版 API 的历史包袱，仅在此保留以维持迁移路径。
- **标签让位的内边距取值口径不同**。本工程经 `useLabelPadding` 取标签元素的 `offsetWidth`（取整）再加 2px 间距写入 input 的内边距；原版 `positionLabel` 用标签的精确宽度与自身间距（实测标签宽约 135.7px 时，原版写 137.7px、本工程写 140px，差值 1–3px）。视觉等效。内边距落在 input 上、由 labelPosition 决定落在哪一侧，这一契约两侧一致。垂直滚动条出现时把滚动条宽度计入 after 标签同侧内边距的补偿（原版 `positionLabel` 的 `+ scrollWidth` 分支）已对齐。
- **`resolveTitle` 的兜底随 props 重渲染重算**。原版 TitledElement 的「invisibleLabel → title」兜底只在构造期求值（后续 `setLabel`/`setInvisibleLabel` 不重算 title），本工程每次渲染按当前 props 计算，label 后续变化会联动 title。这是声明式求值时机的固有差异，兜底能力本身两侧一致。

### 暂未实现

原版有、本工程也认可其价值，但当前没做（含只做了简化版）。这一节最终应当清空。

- **Popup 的容器钳制是简化版**。原版会按 `$container`（默认就近滚动容器）和 `containerPadding` 把弹层钳制在容器内。本工程只向上找第一个 `overflow: auto/scroll` 祖先，未完整复刻 `getClosestScrollableElementContainer`。
- **工具栏有两处未实现**：
  - **PopupToolGroup 的对齐侧选择**。面板 portal 至 body 后按视口口径定位、固定起始边对齐（LTR 左、RTL 右，经 `useAnchoredPanelLayout` 与 MenuSelect 共用实现）。原版 `FloatableElement` 会按左右空间选择对齐侧、空间不足时填充容器，这部分未实现。窄栏类已按原版 `setNarrow` 下发到面板的窄栏载体。
  - **弹出工具置于 List/Menu 组内不可用**（原版同样不可用，故不修）。选中工具会先收起组面板，浮层锚点随面板 `display:none` 归零。实测原版侧工具转激活态但浮层不显示（`hideWhenOutOfView` 判定），本工程侧浮层弹出但定位到视口左上角。
- **`confirm`/`alert`/`prompt` 是简化实现**。原版经全局单例 WindowManager 异步开关窗口（`openWindow`/`closeWindow` 返回 Promise）。本工程各弹窗独立挂载，没有同一管理器的开窗队列，重复调用会层叠而不是替换前一个；ESC 与焦点陷阱绑在弹窗自身，多层层叠时天然只有顶层响应。这对应原版 `OO.ui.WindowInstance` 的单窗口状态机：原版由 `WindowManager` 持有，本工程的 `src/dialogs/WindowManager.tsx` 已退化为 portal 容器（组件注释即声明「仅承担容器职责，不含原版的开窗队列管理」）。
- **MessageDialog 未实现竖向动作布局**。原版在 `setDimensions` 之后经 `fitActions` 检测动作区是否横向溢出（`$actions.scrollWidth > clientWidth`），溢出就切到 `oo-ui-messageDialog-actions-vertical`，并把 body 底部让给 foot（`$body.css('bottom', $foot.outerHeight(true))`），布局切换后再 `updateSize`。另有 `getBodyHeight` 覆写（临时改 overflow 后用 `text.outerHeight(true)` 量高）。本工程固定渲染 `oo-ui-messageDialog-actions-horizontal`，没有溢出检测与竖向切换，body 与 foot 的让位由 Dialog 的帧布局承担。注意这个行为不受移动端开关限制，原版在任何尺寸下都会执行。
- **Dialog 的 `toggleIsolation` 未实现**。原版会给兄弟节点加 `inert` 与 `aria-hidden` 做隔离。本工程浮层默认 portal 至 body，一刀切隔离会误伤弹窗内的浮层（导致无法交互）。`OOUIProvider.getPortalContainer` 已支持把浮层指入弹窗容器（豁免通道），真要做隔离还得按浮层的 portal 归属判定豁免，所以仍未做。
- **TitledElement 的修饰键文案未接**。原版 `formatTitleWithAccessKey` 优先取 `jquery.accessKeyLabel` 的 `getAccessKeyLabel`（MediaWiki 侧显示「Alt+Shift+k」一类本地化组合键），纯 DOM 环境拿不到。本工程按原版的回落分支只输出原键值（`title [k]`）。需要时可由宿主提供等价的标签解析通道接入 `resolveTitle`。
- **选项族选中与按压态的图标自动着色未实现**。原版 wikimediaui 主题的 `getElementClasses` 会对选中或按压的 MenuOptionWidget 与 OutlineOptionWidget 自动给图标加 `oo-ui-image-progressive`（不依赖 flags 配置）。本工程除 ButtonOption 按「激活或禁用反色」规则输出变体外，其余选项形态的图标都没有自动着色。
- **标签多选族未接入菜单的焦点归属**。原版 `MenuTagMultiselectWidget` 的菜单以内嵌输入框为 focusOwner。本工程 `TagMultiselect` 与 `MenuTagMultiselect` 未传 `Select` 的 `focusOwnerRef`，高亮项的 `aria-activedescendant` 落在没有 DOM 焦点的菜单根上。`Dropdown` 与 `ComboBoxInput` 已按原版 `setFocusOwner` 落实到持有焦点的元素；这里要先决策标签多选采用何种 combobox/listbox 角色，才能确定落点（原版自身对该组件是否该用兼容 ARIA 的角色也留有疑问）。
- **FieldLayout 的 title 缺字段控件 accessKey 委托**。原版 FieldLayout 构造末尾经覆写的 `formatTitleWithAccessKey` 委托字段控件，label 的 tooltip 会附上字段 accessKey（`Title [k]`）。本工程 FieldLayout 拿不到字段控件的 accessKey，title 为纯文本（title 与 accessKey 同传的组件已由 `resolveTitle` 覆盖键位后缀）。
- **标签让位内边距的取侧未随 RTL 翻转**。原版 `TextInputWidget.positionLabel` 以 `after === rtl ? 'padding-left' : 'padding-right'` 决定内边距落侧（`rtl` 读**根元素**的 computed direction），等价于 before 到行首、after 到行尾。本工程 `useLabelPadding` 固定 before 到左、after 到右，RTL 皮肤下内边距落在错误一侧，LTR 场景一致。

  修复时有三个点要一并考虑。第一，取侧必须跟随**根元素（即样式表）方向**，不能读输入元素自身的 `dir`：标签由主题 CSS 以物理 `left: 0` 与 `right: 0` 定位（`.rtl.css` 整套翻转为 `right: 0` 与 `left: 0`），落点取决于加载的是哪份样式表，而 `dir` 配置按原版只落在 `$input` 上，不改变标签落点。所以改用 `paddingInlineStart`/`paddingInlineEnd` 这类逻辑属性，会在「页面 LTR + input 显式 `dir='rtl'`」时与样式表方向相反。第二，`useInputProps` 会把滚动条宽度计入 after 标签同侧的内边距，该侧应与标签取侧保持同一来源（现在固定 `paddingRight`）。第三，「滚动条让位偏移侧」已按上一条增强改读输入元素自身方向，两者在输入方向与页面方向不一致时会分属不同侧，修复时要一并决定口径。
