import React, { useState } from 'react';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../props';

export type SelectProps = Omit<WidgetProps<HTMLInputElement>, 'ref'>;

const Select: FunctionComponent<SelectProps> = ({
  children,
  classes,
  disabled,
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
      className={selectClassName}
      aria-disabled={false}
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
