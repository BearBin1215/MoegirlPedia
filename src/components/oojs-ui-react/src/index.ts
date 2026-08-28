// 公共导出面：仅含消费者直接使用的组件与类型。
// 对齐原版类层级的中间件（Widget、Option/MenuOption/DecoratedOption/OutlineOption/
// MenuSectionOption/TabOption/RadioOption、MenuSelect等）不从此处导出，仅供组件内部
// 经相对路径引用；目录结构仍按原版类层级组织，以便对照开发（见AGENTS.md）。

// 基础
export { default as Label } from './widgets/Label';

// 图标
export { default as Icon } from './widgets/Icon';
export { default as Indicator } from './widgets/Indicator';

// 按钮
export { default as Button } from './widgets/Button';
export { default as ButtonGroup } from './widgets/ButtonGroup';

// 输入框
export { default as Input } from './widgets/Input';
export { default as TextInput } from './widgets/TextInput';
export { default as NumberInput } from './widgets/NumberInput';
export { default as MultilineTextInput } from './widgets/MultilineTextInput';

// 单选框/复选框
export { default as RadioInput } from './widgets/RadioInput';
export { default as RadioSelect } from './widgets/RadioSelect';
export { default as CheckboxInput } from './widgets/CheckboxInput';

// 选择框。Select系可独立使用（也作为Dropdown/BookletLayout/IndexLayout的内部构建件）
export { default as Dropdown } from './widgets/Dropdown';
export { default as Select } from './widgets/Select';
export { default as TabSelect } from './widgets/TabSelect';
export { default as OutlineSelect } from './widgets/OutlineSelect';

// 布局
export { default as Layout } from './layouts/Layout';
export { default as PanelLayout } from './layouts/PanelLayout';
export { default as PageLayout } from './layouts/PageLayout';
export { default as TabPanelLayout } from './layouts/TabPanelLayout';
export { default as StackLayout } from './layouts/StackLayout';
export { default as MenuLayout } from './layouts/MenuLayout';
export { default as BookletLayout } from './layouts/BookletLayout';
export { default as FieldLayout } from './layouts/FieldLayout';
export { default as HorizontalLayout } from './layouts/HorizontalLayout';
export { default as IndexLayout } from './layouts/IndexLayout';

// 弹窗
export { default as Dialog } from './dialogs/Dialog';
export { default as MessageDialog } from './dialogs/MessageDialog';

// 类型
export type { AccessKeyedElement, ChangeValue, ChangeHandler } from './utils';
