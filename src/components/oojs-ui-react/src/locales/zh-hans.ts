import type { MessageKey, MessageValue } from '../i18n';

/** 简体中文消息包。键名对齐原版OOUI，译文参考translatewiki.net的zh-hans惯例 */
export const zhHans: Partial<Record<MessageKey, MessageValue>> = {
  'ooui-dialog-message-accept': '确定',
  'ooui-dialog-message-reject': '取消',
  'ooui-dialog-process-error': '出现错误',
  'ooui-dialog-process-back': '返回',
  'ooui-dialog-process-dismiss': '解除',
  'ooui-dialog-process-retry': '重试',
  'ooui-dialog-process-continue': '继续',
  'ooui-outline-control-move-up': '上移',
  'ooui-outline-control-move-down': '下移',
  'ooui-outline-control-remove': '移除',
  'ooui-toolgroup-expand': '更多',
  'ooui-toolgroup-collapse': '收起',
  'ooui-combobox-button-label': '切换选项',
  'ooui-popup-widget-close-button-aria-label': '关闭',
  'ooui-field-help': '帮助',
};
