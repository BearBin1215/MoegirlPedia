import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import type { ElementProps } from '../Element';

export interface WindowManagerProps extends ElementProps<HTMLDivElement> {
  /** 是否满屏（size='full'或窄屏自动满屏） */
  full?: boolean;
  /** 是否为模态管理器（输出oo-ui-windowManager-modal类） */
  modal?: boolean;
  /** 弹窗大小，输出`oo-ui-windowManager-size-{size}`类（full时输出size-full） */
  size?: 'small' | 'medium' | 'large' | 'larger' | 'full';
  /** 要渲染的节点 */
  portal?: Element | DocumentFragment,
}

/**
 * 弹窗管理器容器，对齐原版OO.ui.WindowManager：以portal（默认document.body）承载children，
 * 输出管理器尺寸/满屏类供主题CSS定位弹窗；本工程仅承担容器职责，不含原版的开窗队列管理
 */
export const WindowManager = forwardRef<HTMLDivElement, WindowManagerProps>(({
  className,
  children,
  modal = true,
  full,
  size = 'medium',
  portal = document.body,
  ...rest
}, ref) => {

  const classes = clsx(
    className,
    'oo-ui-windowManager',
    modal && 'oo-ui-windowManager-modal',
    // 生效的满屏样式是oo-ui-windowManager-size-full（原版-fullscreen/-floating为无样式的
    // backwards-compat类）；窄屏自动满屏（full=true）同样输出size-full，以命中满屏CSS
    // 并豁免非满屏帧的1em边距+边框规则
    `oo-ui-windowManager-size-${full ? 'full' : size}`,
    full ? 'oo-ui-windowManager-fullscreen' : 'oo-ui-windowManager-floating',
  );

  return createPortal(
    <div
      {...rest}
      className={classes}
      ref={ref}
    >
      {children}
    </div>,
    portal,
  );
});

WindowManager.displayName = 'WindowManager';

