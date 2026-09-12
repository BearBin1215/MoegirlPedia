/**
 * 消息键：键名对齐原版OOUI的i18n键（ooui-*），便于MediaWiki场景直接映射
 * mw.msg的同名消息。仅收录本工程已实现组件涉及的系统级默认文案，
 * 未实现组件（selectfile/copytextlayout等）的键不入列
 */
export type MessageKey =
  | 'ooui-dialog-message-accept'
  | 'ooui-dialog-message-reject'
  | 'ooui-dialog-process-error'
  | 'ooui-dialog-process-back'
  | 'ooui-dialog-process-dismiss'
  | 'ooui-dialog-process-retry'
  | 'ooui-dialog-process-continue'
  | 'ooui-outline-control-move-up'
  | 'ooui-outline-control-move-down'
  | 'ooui-outline-control-remove'
  | 'ooui-toolgroup-expand'
  | 'ooui-toolgroup-collapse'
  | 'ooui-combobox-button-label'
  | 'ooui-popup-widget-close-button-aria-label'
  | 'ooui-field-help';

/** 消息值：字符串或延迟解析函数（如站点侧 () => mw.msg(key) 接入MediaWiki语言体系，对齐原版deferMsg语义） */
export type MessageValue = string | (() => string);

/** 英文默认表，键值对齐原版OOUI dist内联的en消息（0.54.1） */
const en: Record<MessageKey, string> = {
  'ooui-dialog-message-accept': 'OK',
  'ooui-dialog-message-reject': 'Cancel',
  'ooui-dialog-process-error': 'Something went wrong',
  'ooui-dialog-process-back': 'Back',
  'ooui-dialog-process-dismiss': 'Dismiss',
  'ooui-dialog-process-retry': 'Try again',
  'ooui-dialog-process-continue': 'Continue',
  'ooui-outline-control-move-up': 'Move item up',
  'ooui-outline-control-move-down': 'Move item down',
  'ooui-outline-control-remove': 'Remove item',
  'ooui-toolgroup-expand': 'More',
  'ooui-toolgroup-collapse': 'Fewer',
  'ooui-combobox-button-label': 'Toggle options',
  'ooui-popup-widget-close-button-aria-label': 'Close',
  'ooui-field-help': 'Help',
};

// 模块级覆盖表：registerMessages写入，msg读取。命令式API（confirm/alert/prompt）在
// React树外经createRoot渲染、拿不到OOUIProvider，其文案只能走本表
const overrides: Partial<Record<MessageKey, MessageValue>> = {};

/** $1/$2参数替换，对齐原版OO.ui.msg */
function substitute(message: string, params: unknown[]): string {
  return message.replace(/\$(\d+)/g, (unused, n) => {
    const index = parseInt(n, 10) - 1;
    return params[index] !== undefined ? String(params[index]) : `$${n}`;
  });
}

/** 解析单条消息值：函数求值、字符串直出，对齐原版OO.ui.resolveMsg */
export function resolveMessage(value: MessageValue): string {
  return typeof value === 'function' ? value() : value;
}

/** 格式化一条消息值并做参数替换，供msg与Provider侧useMessage共用 */
export function formatMessage(value: MessageValue, params: unknown[]): string {
  return substitute(resolveMessage(value), params);
}

/**
 * 读取消息（英文默认+模块级覆盖），对齐原版OO.ui.msg。声明式组件内请优先使用
 * useMessage（可被OOUIProvider的messages覆盖）；本函数供命令式API与非React场景使用
 */
export function msg(key: MessageKey, ...params: unknown[]): string {
  const override = overrides[key];
  return formatMessage(override ?? en[key], params);
}

/** 模块级注册消息覆盖（并入现有覆盖表，后注册的同键覆盖先注册的） */
export function registerMessages(map: Partial<Record<MessageKey, MessageValue>>): void {
  Object.assign(overrides, map);
}
