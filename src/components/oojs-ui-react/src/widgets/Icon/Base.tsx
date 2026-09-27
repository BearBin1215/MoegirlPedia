import React, { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';
import type { IconElement } from '../../Element';

export type IconBaseProps =
  HTMLAttributes<HTMLSpanElement> &
  IconElement;

/** 图标基础元素（无Widget包装），输出图标类与noIcon占位类，供各组件内嵌复用 */
export const IconBase = forwardRef<HTMLSpanElement, IconBaseProps>(({
  className,
  icon,
  ...rest
}, ref) => {
  // noIcon占位类对齐原版IconElement.setIcon：无图标时输出（主题CSS以其隐藏空占位）
  const classes = clsx(
    'oo-ui-iconElement-icon',
    !icon && 'oo-ui-iconElement-noIcon',
    icon && `oo-ui-icon-${icon}`,
    className,
  );

  return <span ref={ref} {...rest} className={classes} />;
});

IconBase.displayName = 'IconBase';
