import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import { processClassNames } from '../../utils/tool';
import type { ChangeEvent } from 'react';
import type { InputProps } from '../../types/props';
import type { ElementRef } from '../../types/ref';

export interface RadioInputProps extends Omit<InputProps<boolean, HTMLInputElement, HTMLSpanElement>, 'defaultValue' | 'placeholder'> {
  selected?: boolean;
}

const RadioInput = forwardRef<ElementRef<HTMLSpanElement>, RadioInputProps>(({
  accessKey,
  className,
  disabled,
  name,
  onChange,
  required,
  selected,
  ...rest
}, ref) => {
  const [checked, setChecked] = useState(!!selected);
  const elementRef = useRef<HTMLSpanElement>(null);

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

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }));

  return (
    <span
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      ref={elementRef}
    >
      <input
        type='radio'
        className='oo-ui-inputWidget-input'
        accessKey={accessKey}
        disabled={disabled}
        checked={selected}
        name={name}
        onChange={handleChange}
        required={required}
        tabIndex={disabled ? -1 : 0}
      />
      <span />
    </span>
  );
});

RadioInput.displayName = 'RadioInput';

export default RadioInput;
