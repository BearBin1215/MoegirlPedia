import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { generateWidgetClassName } from '../../utils';
import type { WidgetProps } from '../Widget';
import { LabelBase, type LabelElement } from './Base';

/** 标签相对控件的位置（输入类组件经labelPosition使用） */
export type LabelPosition = 'before' | 'after';

export type LabelProps = WidgetProps<HTMLSpanElement>;

/** 独立标签组件，对齐原版OO.ui.LabelWidget：基于LabelBase附加Widget类名 */
export const Label = forwardRef<HTMLSpanElement, LabelProps>(({
  className,
  children,
  disabled,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, label: children }, 'label'),
    'oo-ui-labelElement',
  );

  return (
    <LabelBase
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      {children}
    </LabelBase>
  );
});

Label.displayName = 'Label';

export { LabelElement };
