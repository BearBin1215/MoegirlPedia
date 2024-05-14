import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import IconWidget from '../Icon';
import { processClassNames } from '../../utils/tool';
import type { RefObject, ChangeEvent } from 'react';
import type { InputProps } from '../../types/props';
import type { AccessKeyElement } from '../../types/mixin';
import type { SelectWidgetRef } from '../../types/ref';

export interface CheckboxInputProps extends
  Omit<InputProps<boolean>, 'placeholder' | 'ref'>,
  AccessKeyElement {

  ref?: RefObject<HTMLSpanElement>;
}

const CheckboxInput = forwardRef<SelectWidgetRef<HTMLSpanElement>, CheckboxInputProps>(({
  name,
  accessKey,
  className,
  defaultValue = false,
  disabled,
  onChange,
  ...rest
}, ref) => {
  const [value, setValue] = useState(defaultValue);
  const SelectWidgetRef = useRef<HTMLSpanElement>(null);

  const classes = classNames(
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

  useImperativeHandle(ref, () => ({
    element: SelectWidgetRef.current,
    isSelected: () => value,
    setSelected: (newValue: boolean) => setValue(newValue),
  }));

  return (
    <span
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      ref={SelectWidgetRef}
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
});

CheckboxInput.displayName = 'CheckboxInput';

export default CheckboxInput;
