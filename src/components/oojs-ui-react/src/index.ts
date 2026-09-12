// 公共导出面：仅含消费者直接使用的组件与类型。
// 每个消费者可见组件配套导出其Props类型（包装组件转发、声明式props数组的类型标注所需），
// 与组件合并为一条导出语句（类型经内联type标记，兼容isolatedModules）；
// 数组项等紧邻类型（如各Select系的OptionProps、PopupPosition、Indicators）一并导出。
// 对齐原版类层级的中间件（Widget、Option/MenuOption/DecoratedOption/OutlineOption/
// MenuSectionOption/TabOption/RadioOption、MenuSelect等）不从此处导出，仅供组件内部
// 经相对路径引用；目录结构仍按原版类层级组织，以便对照开发（见AGENTS.md）。

// 基础
export { Label, type LabelProps } from './widgets/Label';

// 图标
export { Icon, type IconProps } from './widgets/Icon';
export { Indicator, type IndicatorProps, type Indicators } from './widgets/Indicator';

// 按钮
export { Button, type ButtonProps } from './widgets/Button';
export { ButtonGroup, type ButtonGroupProps } from './widgets/ButtonGroup';
export { PopupButton, type PopupButtonProps } from './widgets/PopupButton';

// 弹出层
export { Popup, type PopupProps, type PopupPosition } from './widgets/Popup';

// 输入框
// PromptOptions.textInput按名引用TextInputProps，需随导出面提供
export { TextInput, type TextInputProps } from './widgets/TextInput';
export { NumberInput, type NumberInputProps } from './widgets/NumberInput';
export { MultilineTextInput, type MultilineTextInputProps } from './widgets/MultilineTextInput';

// 消息提示
export { Message, type MessageProps, type MessageType } from './widgets/Message';

// 进度条
export { ProgressBar, type ProgressBarProps } from './widgets/ProgressBar';

// 备选项输入框
export { ComboBoxInput, type ComboBoxInputProps } from './widgets/ComboBoxInput';

// 单选框/复选框
export { RadioInput, type RadioInputProps } from './widgets/RadioInput';
export { RadioSelect, type RadioSelectProps } from './widgets/RadioSelect';
export { CheckboxInput, type CheckboxInputProps } from './widgets/CheckboxInput';
export { CheckboxMultiselect, type CheckboxMultiselectProps } from './widgets/CheckboxMultiselect';

// 表单输入控件（配合FormLayout做浏览器原生提交）
export { ButtonInput, type ButtonInputProps } from './widgets/ButtonInput';
export {
  DropdownInput,
  type DropdownInputProps,
  type DropdownInputOption,
} from './widgets/DropdownInput';
export { RadioSelectInput, type RadioSelectInputProps } from './widgets/RadioSelectInput';
export { CheckboxMultiselectInput, type CheckboxMultiselectInputProps } from './widgets/CheckboxMultiselectInput';

// 选择框。Select系可独立使用（也作为Dropdown/BookletLayout/IndexLayout的内部构建件），
// options数组项类型随组件导出（声明式props数组的标注所需）
export { Dropdown, type DropdownProps, type DropdownOptionProps } from './widgets/Dropdown';
export { Select, type SelectProps, type SelectOptionProps } from './widgets/Select';
export { TabSelect, type TabSelectProps, type TabSelectOptionProps } from './widgets/TabSelect';
export { OutlineSelect, type OutlineSelectProps } from './widgets/OutlineSelect';

// 布局
export { Layout, type LayoutProps } from './layouts/Layout';
export { PanelLayout, type PanelLayoutProps } from './layouts/PanelLayout';
export { PageLayout, type PageLayoutProps } from './layouts/PageLayout';
export { TabPanelLayout, type TabPanelLayoutProps } from './layouts/TabPanelLayout';
export { StackLayout, type StackLayoutProps } from './layouts/StackLayout';
export { BookletLayout, type BookletLayoutProps } from './layouts/BookletLayout';
export { FieldLayout, type FieldLayoutProps } from './layouts/FieldLayout';
export { FieldsetLayout, type FieldsetLayoutProps } from './layouts/FieldsetLayout';
export { ActionFieldLayout, type ActionFieldLayoutProps } from './layouts/ActionFieldLayout';
export { FormLayout, type FormLayoutProps } from './layouts/FormLayout';
export { HorizontalLayout, type HorizontalLayoutProps } from './layouts/HorizontalLayout';
export {
  IndexLayout,
  type IndexLayoutProps,
  type IndexLayoutTabProps,
} from './layouts/IndexLayout';

// 工具栏
export { Toolbar, type ToolbarProps } from './toolbars/Toolbar';
export { BarToolGroup, type BarToolGroupProps } from './toolbars/BarToolGroup';
export { ListToolGroup, type ListToolGroupProps } from './toolbars/ListToolGroup';
export { MenuToolGroup, type MenuToolGroupProps } from './toolbars/MenuToolGroup';
// tools数组的项类型即ToolProps，随工具栏系列共同构成声明式工具配置
export type { ToolProps } from './toolbars/Tool';

// 弹窗
export { Dialog, type DialogProps } from './dialogs/Dialog';
export { MessageDialog, type MessageDialogProps } from './dialogs/MessageDialog';
export {
  ProcessDialog,
  type ProcessDialogProps,
  type ProcessDialogActionProps,
  type ProcessDialogErrorProps,
} from './dialogs/ProcessDialog';
// confirm/alert/prompt对齐原版OO.ui.confirm/OO.ui.alert/OO.ui.prompt：独立命令式API，
// 非MessageDialog静态方法
export { confirm, alert, prompt } from './dialogs/statics';
export type { ConfirmAlertOptions, AlertOptions, PromptOptions } from './dialogs/statics';

// 全局配置与消息（i18n）。OOUIProvider映射原版OO.ui命名空间的可覆写全局（消息表、
// 浮层portal容器、isMobile、dir、viewportSpacing），为声明式组件提供React语境的全局配置；
// msg/deferMsg/resolveMsg/registerMessages供命令式API（confirm/alert/prompt）与非React场景使用
export {
  OOUIProvider,
  useOOUIConfig,
  useMessage,
  useIsMobile,
  useDir,
  useViewportSpacing,
} from './config';
export type { OOUIConfig, ViewportSpacing, ViewportSpacingInput, Direction } from './config';
export { msg, deferMsg, resolveMsg, registerMessages } from './i18n';
export type { MessageKey, MessageValue } from './i18n';
export { zhHans } from './locales/zh-hans';

// 类型
export type { AccessKeyedElement, ChangeHandler } from './utils';
