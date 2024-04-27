import React, { useState } from 'react';
import classNames from 'classnames';
import { processClassNames } from '../utils/tool';
import type { FunctionComponent, ChangeEvent, RefObject } from 'react';
import type { InputProps } from '../types/props';

export interface RadioInputProps extends Omit<InputProps<any>, 'defaultValue' | 'ref' | 'placeholder'> {
  ref?: RefObject<HTMLSpanElement>;
  selected?: boolean;
}

const RadioInput: FunctionComponent<RadioInputProps> = ({
  accessKey,
  className,
  disabled,
  name,
  onChange,
  required,
  selected,
  ...rest
}) => {
  const [checked, setChecked] = useState(!!selected);

  const classes = classNames(
    className,
    processClassNames({ disabled }, 'input', 'radioInput'),
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const oldValue = checked;
    const value = event.target.checked;
    setChecked(value);
    if (typeof onChange === 'function') {
      onChange({
        value,
        oldValue,
        event,
      });
    }
  };

  return (
    <span
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
    >
      <input
        type='radio'
        className='oo-ui-inputWidget-input'
        accessKey={accessKey}
        checked={checked}
        name={name}
        onChange={handleChange}
        required={required}
        tabIndex={disabled ? -1 : 0}
      />
      <span />
    </span>
  );
};

export default RadioInput;
