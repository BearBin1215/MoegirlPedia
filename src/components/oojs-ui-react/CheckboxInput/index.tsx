import React, { useState } from 'react';
import classNames from 'classnames';
import IconWidget from '../Icon';
import { processClassNames } from '../utils/tool';
import type { RefObject, FunctionComponent, ChangeEvent } from 'react';
import type { InputProps } from '../types/props';
import type { AccessKeyElement } from '../types/mixin';

export interface CheckboxInputProps extends
  Omit<InputProps<boolean>, 'placeholder' | 'ref'>,
  AccessKeyElement {

  ref?: RefObject<HTMLSpanElement>;
}

const CheckboxInput: FunctionComponent<CheckboxInputProps> = ({
  name,
  accessKey,
  className,
  defaultValue = false,
  disabled,
  onChange,
  ...rest
}) => {
  const [value, setValue] = useState(defaultValue);

  const widgetClassName = classNames(
    className,
    processClassNames({ disabled }, 'input', 'checkboxInput'),
  );

  /** 值变更响应 */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
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
    <span
      {...rest}
      className={widgetClassName}
      aria-disabled={!!disabled}
    >
      <input
        name={name}
        type='checkbox'
        tabIndex={disabled ? -1 : 0}
        accessKey={accessKey}
        aria-disabled={!!disabled}
        className='oo-ui-inputWidget-input'
        checked={value}
        disabled={disabled}
        onChange={handleChange}
      />
      <IconWidget
        icon='check'
        className='oo-ui-labelElement-invisible oo-ui-image-invert'
      />
    </span>
  );
};

export default CheckboxInput;
