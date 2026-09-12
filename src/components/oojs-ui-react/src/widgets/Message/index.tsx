import React, { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { LabelBase } from '../Label/Base';
import { Button } from '../Button';
import { generateWidgetClassName } from '../../utils';
import type { WidgetProps } from '../Widget';
import type { IconElement } from '../Icon';

/** 消息类型（非法值回退notice） */
export type MessageType = 'notice' | 'error' | 'warning' | 'success';

/** 类型→默认图标映射 */
const TYPE_ICONS: Record<MessageType, string> = {
  notice: 'infoFilled',
  error: 'error',
  warning: 'alert',
  success: 'success',
};

export interface MessageProps extends
  WidgetProps<HTMLDivElement>,
  IconElement {

  /** 消息正文 */
  children?: ReactNode;

  /** 正文是否视觉隐藏 */
  invisibleLabel?: boolean;

  /** 消息类型，决定默认图标与配色（error为红色警示、warning橙色等） */
  type?: MessageType;

  /** 内联展示（false时渲染为带边框的块级消息） */
  inline?: boolean;

  /** 是否展示关闭按钮（inline消息不渲染关闭按钮） */
  showClose?: boolean;

  /** 点击关闭按钮回调（组件不自行隐藏，由调用方控制显隐） */
  onClose?: () => void;
}

/**
 * 消息提示，对齐原版OO.ui.MessageWidget：error类型使用role=alert，其余类型aria-live=polite
 */
export const Message = forwardRef<HTMLDivElement, MessageProps>(({
  children,
  className,
  disabled,
  icon,
  invisibleLabel,
  type = 'notice',
  inline = false,
  showClose = false,
  onClose,
  ...rest
}, ref) => {
  // 非法type回退notice
  const messageType: MessageType = TYPE_ICONS[type] ? type : 'notice';
  // 显式传入icon时覆盖类型默认图标
  const displayIcon = icon ?? TYPE_ICONS[messageType];
  const showCloseButton = showClose && !inline;

  const classes = clsx(
    className,
    // invisibleLabel的裁剪类只落在label元素上（下方LabelBase），不得经此挂到根元素（原版LabelElement语义）
    generateWidgetClassName({ disabled, icon: displayIcon, label: children }),
    'oo-ui-messageWidget',
    !inline && 'oo-ui-messageWidget-block',
    showCloseButton && 'oo-ui-messageWidget-showClose',
    `oo-ui-flaggedElement-${messageType}`,
  );

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      // 对齐原版setType：error用role=alert打断式播报，其余类型polite播报
      role={messageType === 'error' ? 'alert' : undefined}
      aria-live={messageType === 'error' ? undefined : 'polite'}
      ref={ref}
    >
      {/* 图标变体类跟随消息类型（对齐原版oo-ui-image-{type}），notice无对应变体样式仅回退默认色 */}
      <IconBase icon={displayIcon} className={`oo-ui-image-${messageType}`} />
      <LabelBase className={clsx(invisibleLabel && 'oo-ui-labelElement-invisible')}>{children}</LabelBase>
      {showCloseButton && (
        <Button
          className='oo-ui-messageWidget-close'
          framed={false}
          icon='close'
          invisibleLabel
          onClick={onClose}
        >
          Close
        </Button>
      )}
    </div>
  );
});

Message.displayName = 'Message';

