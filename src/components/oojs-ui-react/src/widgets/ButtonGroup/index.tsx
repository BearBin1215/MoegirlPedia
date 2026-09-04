import React, { forwardRef } from 'react';
import clsx from 'clsx';
import Widget, { type WidgetProps } from '../Widget';

/** 按钮组（children为Button元素；disabled仅作用于组容器样式，按钮禁用需在各Button上声明） */
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
      {children}
    </Widget>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
