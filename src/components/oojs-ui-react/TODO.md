## 底层

- [x] 将Icon、Indictor等常见复用元素封装
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
- [ ] popup

## 低优先度实现

- [ ] 滑动（ToggleSwitch）
- [x] Tab（IndexLayout/TabSelect/TabOption/TabPanelLayout）
- [x] Menu
- [ ] 备选项输入框（ComboBox）
- [ ] 搜索输入框

其他布局类组件

## 未对齐行为记录

- TabOptionWidget：未实现`scrollIntoViewOnSelect`（移动端选中后水平居中滚动）与`href`链接支持（仅PHP端使用）
- TabSelect：原版SelectWidget支持按住拖动跨选项选择（mousedown拖拽→mouseup选中），React版简化为onClick选择
