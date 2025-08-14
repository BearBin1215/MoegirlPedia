import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { generateWidgetClassName } from '../../utils';
import type { WidgetProps } from '../Widget';
import LabelBase, { type LabelElement } from './Base';

export type LabelPosition = 'before' | 'after';

export type LabelProps = WidgetProps<HTMLSpanElement>;

const Label = forwardRef<HTMLSpanElement, LabelProps>(({
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
      aria-disabled={!!disabled}
      ref={ref}
    >
      {children}
    </LabelBase>
  );
});

Label.displayName = 'Label';

export default Label;
export { LabelElement };
