import React, { forwardRef, type ReactElement } from 'react';
import clsx from 'clsx';
import Widget, { type WidgetProps } from '../Widget';
import type { ButtonProps } from '../Button';

export interface ButtonGroupProps extends WidgetProps {
  children: ReactElement<ButtonProps> | ReactElement<ButtonProps>[];
}

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(({
  className,
  children,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    'oo-ui-buttonGroupWidget',
  );
  return (
    <Widget
      {...rest}
      className={classes}
      ref={ref}
    >
      {children}
    </Widget>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
