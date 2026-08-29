import React, { forwardRef } from 'react';
import clsx from 'clsx';
import Widget, { type WidgetProps } from '../Widget';
import Button, { type ButtonProps } from '../Button';

export interface ButtonGroupProps extends Omit<WidgetProps, 'children'> {
  /** 按钮组参数。`id`为按钮DOM id，同时作为列表key */
  buttons?: (ButtonProps & { id?: string })[];
}

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(({
  className,
  buttons = [],
  disabled,
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
      {buttons.map((item, i) => (
        <Button
          key={item.id ?? i}
          {...item}
          disabled={item.disabled || disabled}
        />
      ))}
    </Widget>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
