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

## 低优先度实现

- [ ] 滑动（ToggleSwitch）
- [x] Tab（IndexLayout/TabSelect/TabOption/TabPanelLayout）
- [x] Menu
- [ ] 备选项输入框（ComboBox）
- [ ] 搜索输入框

其他布局类组件

## 未对齐行为记录

- TabOptionWidget：未实现`scrollIntoViewOnSelect`（移动端选中后水平居中滚动）与`href`链接支持（仅PHP端使用）
- Popup：原版还会按`$container`（默认就近滚动容器）+`containerPadding`将弹层钳制在容器内，React版已实现但容器探测为简化版（向上找第一个overflow auto/scroll祖先，未完整复刻getClosestScrollableElementContainer）；自动翻转的两方向空间比较为简化实现（预计算空间而非原版的定位后测量）
- MenuSelect（Dropdown菜单）：浮动定位已实现但为简化版——原版FloatableElement基于offsetParent做相对定位并计入RTL方向与滚动条沟槽，React版直接portal至body用页面坐标定位；ClippableElement裁剪锚定视口而非原版的就近滚动容器，未实现原版的`hideWhenOutOfView`基于`$floatableClosestScrollable`的精确判定（简化为视口判定）；不支持原版DropdownWidget的`$overlay`配置
- TabSelect：原版SelectWidget支持按住拖动跨选项选择（mousedown拖拽→mouseup选中）——已实现；有意偏离：原版的`selecting`在丢失mouseup（如鼠标移出窗口释放）后会残留、下次点击空白处会误提交旧选项，React版在mousedown时重置拖拽状态并监听pointercancel清理
- Dialog（confirm/alert静态方法）：原版通过WindowManager异步开关窗口（openWindow/closeWindow Promise），React版为简化实现，无多窗口堆栈管理；按钮默认文本为硬编码OK/Cancel，未接入OO.ui.msg消息本地化
