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
