import React, {
  useState,
  forwardRef,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import { generateWidgetClassName } from '../../utils';
import type { InputProps } from '../Input';

export interface RadioInputProps extends Omit<InputProps<
  boolean,
  HTMLInputElement,
  HTMLSpanElement
>, 'placeholder'> {
  selected?: boolean;
}

const RadioInput = forwardRef<HTMLSpanElement, RadioInputProps>(({
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

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'input', 'radioInput'),
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
      ref={ref}
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
