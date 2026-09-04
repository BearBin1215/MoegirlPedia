import React, {
  forwardRef,
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
} from 'react';
import clsx from 'clsx';
import Widget, { type WidgetProps } from '../Widget';
import Button, { type ButtonProps } from '../Button';

/** 按钮组（children为Button元素；组级disabled会传播到各Button，对齐原版GroupWidget语义） */
export type ButtonGroupProps = WidgetProps;

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(({
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
      {Children.map(children, (child) => {
        if (isValidElement(child) && child.type === Button) {
          return cloneElement(child as ReactElement<ButtonProps>, {
            disabled: disabled || (child.props as ButtonProps).disabled,
          });
        }
        return child;
      })}
    </Widget>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
