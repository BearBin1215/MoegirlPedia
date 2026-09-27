import React, {
  forwardRef,
  type HTMLAttributes,
} from 'react';
import clsx from 'clsx';

export type LabelBaseProps = HTMLAttributes<HTMLSpanElement> & {
  /**
   * 标签视觉隐藏（对齐原版LabelElement.setInvisibleLabel）：裁剪类落在label元素上——
   * 主题以该元素为选择器，且标签文本仍作为可访问名保留。组件级的`invisibleLabel`
   * （同时抑制根元素的oo-ui-labelElement类）经labelElementClasses承担，本prop只管
   * label元素自身的裁剪类
   */
  invisible?: boolean;
};

/** 标签基础元素（无Widget包装），输出oo-ui-labelElement-label类，供各组件内嵌复用 */
export const LabelBase = forwardRef<HTMLSpanElement, LabelBaseProps>(({
  className,
  children,
  invisible,
  ...rest
}, ref) => {
  const classes = clsx(
    'oo-ui-labelElement-label',
    invisible && 'oo-ui-labelElement-invisible',
    className,
  );

  return (
    <span
      {...rest}
      className={classes}
      ref={ref}
    >
      {children}
    </span>
  );
});

LabelBase.displayName = 'LabelBase';
