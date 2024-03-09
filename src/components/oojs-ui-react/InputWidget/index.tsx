import React, { useState } from 'react';
import classNames from 'classnames';
import type { FunctionComponent, ChangeEvent } from 'react';
import type { InputChangeValue } from '../utils';
import type { WidgetProps } from '../props';

export interface InputWidgetProps<T> extends Omit<WidgetProps<HTMLInputElement>, 'children'> {
  name?: string;

  /** 默认值 */
  defaultValue?: T;

  /** 值变化回调函数 */
  onChange?: (data: InputChangeValue<T>) => void;

  /**  */
  placeholder?: string;

  type?: string;
}

const InputWidget: FunctionComponent<InputWidgetProps<string | number>> = ({
  name,
  classes,
  defaultValue,
  disabled,
  onChange,
  placeholder,
  ...rest
}) => {
  const [value, setValue] = useState(defaultValue);

  const className = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-inputWidget',
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
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
        name={name}
        onChange={handleChange}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={!!disabled}
        className='oo-ui-inputWidget-input'
        disabled={disabled}
        value={value}
        placeholder={placeholder}
      />
    </div>
  );
};

export default InputWidget;
