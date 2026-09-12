import React, {
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import clsx from 'clsx';

export interface LabelElement {
  /** 标签显示内容 */
  label?: ReactNode;
  /** 标签可视 */
  invisibleLabel?: boolean;
}

export type LabelBaseProps = HTMLAttributes<HTMLSpanElement> & LabelElement;

/** 标签基础元素（无Widget包装），输出oo-ui-labelElement-label类，供各组件内嵌复用 */
export const LabelBase = forwardRef<HTMLSpanElement, LabelBaseProps>(({
  className,
  children,
  ...rest
}, ref) => {
  const classes = clsx('oo-ui-labelElement-label', className);

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

