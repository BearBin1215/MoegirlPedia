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
  'ooui-item-remove': '移除',
  'ooui-field-help': '帮助',
  'ooui-copytextlayout-copy': '复制',
  'ooui-selectfile-button-select': '选择文件',
  'ooui-selectfile-button-select-multiple': '选择多个文件',
  'ooui-selectfile-placeholder': '未选择文件',
  'ooui-selectfile-dragdrop-placeholder': '拖放文件到此处',
  'ooui-selectfile-dragdrop-placeholder-multiple': '拖放多个文件到此处',
};
