import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Widget, type WidgetProps } from '../Widget';
import { ButtonGroupDisabledProvider } from './context';

/** 按钮组（children为Button元素；组级disabled经Context下发到组内按钮，为React便捷行为，原版无此JS传播） */
export type ButtonGroupProps = WidgetProps;

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(({
  className,
  disabled,
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
      disabled={disabled}
      ref={ref}
    >
      <ButtonGroupDisabledProvider value={disabled}>
        {children}
      </ButtonGroupDisabledProvider>
    </Widget>
  );
});

ButtonGroup.displayName = 'ButtonGroup';
