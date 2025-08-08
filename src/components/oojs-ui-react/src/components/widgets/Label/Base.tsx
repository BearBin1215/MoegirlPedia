import React, {
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import clsx from 'clsx';

export interface LabelElement {
  /** 标签显示内容 */
  label?: ReactNode;
}

export interface LabelBaseProps extends
  Omit<HTMLAttributes<HTMLSpanElement>, 'className'>,
  LabelElement {

  className?: string;
}

const LabelBase = forwardRef<HTMLSpanElement, LabelBaseProps>(({
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

export default LabelBase;
