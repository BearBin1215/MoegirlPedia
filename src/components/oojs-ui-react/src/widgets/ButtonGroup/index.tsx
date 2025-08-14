import React, { forwardRef, type Key } from 'react';
import clsx from 'clsx';
import Widget, { type WidgetProps } from '../Widget';
import Button, { type ButtonProps } from '../Button';

export interface ButtonGroupProps extends Omit<WidgetProps, 'children'> {
  /** 按钮组参数 */
  buttons?: (ButtonProps & { key: Key})[];
}

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(({
  className,
  buttons = [],
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
      {buttons.map((item) => <Button {...item} />)}
    </Widget>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
