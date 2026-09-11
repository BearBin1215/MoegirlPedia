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
export type { ButtonProps } from './widgets/Button';
export { default as ButtonGroup } from './widgets/ButtonGroup';
export { default as PopupButton } from './widgets/PopupButton';

// 弹出层
export { default as Popup } from './widgets/Popup';

// 输入框
export { default as TextInput } from './widgets/TextInput';
export { default as NumberInput } from './widgets/NumberInput';
export { default as MultilineTextInput } from './widgets/MultilineTextInput';
// PromptOptions.textInput按名引用该类型，需随导出面提供
export type { TextInputProps } from './widgets/TextInput';

// 消息提示
export { default as Message } from './widgets/Message';
export type { MessageType } from './widgets/Message';

// 进度条
export { default as ProgressBar } from './widgets/ProgressBar';

// 备选项输入框
export { default as ComboBoxInput } from './widgets/ComboBoxInput';

// 单选框/复选框
export { default as RadioInput } from './widgets/RadioInput';
export { default as RadioSelect } from './widgets/RadioSelect';
export { default as CheckboxInput } from './widgets/CheckboxInput';
export { default as CheckboxMultiselect } from './widgets/CheckboxMultiselect';

// 表单输入控件（配合FormLayout做浏览器原生提交）
export { default as ButtonInput } from './widgets/ButtonInput';
export { default as DropdownInput } from './widgets/DropdownInput';
export { default as RadioSelectInput } from './widgets/RadioSelectInput';
export { default as CheckboxMultiselectInput } from './widgets/CheckboxMultiselectInput';

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
export { default as BookletLayout } from './layouts/BookletLayout';
export { default as FieldLayout } from './layouts/FieldLayout';
export { default as FieldsetLayout } from './layouts/FieldsetLayout';
export { default as ActionFieldLayout } from './layouts/ActionFieldLayout';
export { default as FormLayout } from './layouts/FormLayout';
export { default as HorizontalLayout } from './layouts/HorizontalLayout';
export { default as IndexLayout } from './layouts/IndexLayout';

// 工具栏
export { default as Toolbar } from './toolbars/Toolbar';
export { default as BarToolGroup } from './toolbars/BarToolGroup';
export { default as ListToolGroup } from './toolbars/ListToolGroup';
export { default as MenuToolGroup } from './toolbars/MenuToolGroup';
export type { ToolProps } from './toolbars/Tool';

// 弹窗
export { default as Dialog } from './dialogs/Dialog';
export { default as MessageDialog } from './dialogs/MessageDialog';
export { default as ProcessDialog } from './dialogs/ProcessDialog';
export type {
  ProcessDialogActionProps,
  ProcessDialogErrorProps,
} from './dialogs/ProcessDialog';
// confirm/alert/prompt对齐原版OO.ui.confirm/OO.ui.alert/OO.ui.prompt：独立命令式API，
// 非MessageDialog静态方法
export { confirm, alert, prompt } from './dialogs/statics';
export type { ConfirmAlertOptions, AlertOptions, PromptOptions } from './dialogs/statics';

// 类型
export type { AccessKeyedElement, ChangeHandler } from './utils';
