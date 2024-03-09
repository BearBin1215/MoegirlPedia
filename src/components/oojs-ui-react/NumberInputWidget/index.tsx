import React, { useState } from 'react';
import classNames from 'classnames';
import type { FunctionComponent, ChangeEvent } from 'react';
import type { InputWidgetProps } from '../props';

export interface NumberInputWidgetProps extends InputWidgetProps<number | undefined> {
  /** 是否显示左右按钮 */
  showButtons?: boolean;

  /** 最小值 */
  min?: number;

  /** 最大值 */
  max?: number;

  /** 间距 */
  step?: number;

  /** 精度 */
  precision?: number;
}

/**
 * 数字输入框
 */
const NumberInputWidget: FunctionComponent<NumberInputWidgetProps> = ({
  name,
  classes,
  defaultValue,
  disabled,
  onChange,
  placeholder,
  min,
  max,
  step,
  // precision,
  ...rest
}) => {
  const [value, setValue] = useState(defaultValue);

  const className = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-inputWidget',
    'oo-ui-textInputWidget',
    'oo-ui-textInputWidget-type-text',
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = +event.target.value;
    setValue(newValue);
    if (typeof onChange === 'function') {
      onChange({
        value: newValue,
        oldValue: value,
        event,
      });
    }
  };

  return (
    <div
      {...rest}
      className={className}
      aria-disabled={false}
    >
      <input
        type='number'
        name={name}
        onChange={handleChange}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={!!disabled}
        className='oo-ui-inputWidget-input'
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
      <span className='oo-ui-iconElement-icon' />
      <span className='oo-ui-indicatorElement-indicator' />
    </div>
  );
};

export default NumberInputWidget;
