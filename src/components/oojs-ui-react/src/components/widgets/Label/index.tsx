import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { generateWidgetClassName } from 'oojs-ui-react/utils/tool';
import type { WidgetProps } from '../Widget';
import LabelBase from './Base';

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
