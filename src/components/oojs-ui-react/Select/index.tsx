import React, { useState } from 'react';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../props';

export type SelectProps = Omit<WidgetProps<HTMLDivElement>, 'ref'>;

const Select: FunctionComponent<SelectProps> = ({
  children,
  classes,
  disabled,
  ...rest
}) => {
  const [pressed, setPressed] = useState(false);

  const childrens = Array.isArray(children) ? children : [children]; // 确保子组件为数组
  const selectClassName = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-selectWidget',
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-depressed',
  );


  return (
    <div
      {...rest}
      className={selectClassName}
      aria-disabled={!!disabled}
      tabIndex={-1}
      role='option'
      aria-selected={false}
      onMouseUp={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseLeave={() => setPressed(false)}
    >
      {childrens}
    </div>
  );
};

export default Select;
