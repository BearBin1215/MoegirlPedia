import React, { forwardRef } from 'react';
import classNames from 'classnames';
import LabelBase from './Base';
import { processClassNames } from '../../../utils/tool';
import type { WidgetProps } from '../Widget';

export type LabelProps = WidgetProps<HTMLSpanElement>;

const Label = forwardRef<HTMLSpanElement, LabelProps>(({
  className,
  children,
  disabled,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    processClassNames({ disabled, label: children }, 'label'),
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
