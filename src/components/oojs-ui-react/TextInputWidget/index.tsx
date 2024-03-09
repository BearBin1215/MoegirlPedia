import React, { useState } from 'react';
import classNames from 'classnames';
import type { FunctionComponent, ChangeEvent } from 'react';
import type { InputWidgetProps } from '../props';

export type TextInputWidgetProps = InputWidgetProps<string>

const TextInputWidget: FunctionComponent<TextInputWidgetProps> = ({
  name,
  classes,
  defaultValue,
  disabled,
  onChange,
  placeholder,
  ...rest
}) => {
  const [value, setValue] = useState(defaultValue || '');

  const className = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-inputWidget',
    'oo-ui-textInputWidget',
    'oo-ui-textInputWidget-type-text',
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
        type='text'
        name={name}
        onChange={handleChange}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={!!disabled}
        className='oo-ui-inputWidget-input'
        disabled={disabled}
        value={value}
        placeholder={placeholder}
      />
      <span className='oo-ui-iconElement-icon' />
      <span className='oo-ui-indicatorElement-indicator' />
    </div>
  );
};

export default TextInputWidget;
