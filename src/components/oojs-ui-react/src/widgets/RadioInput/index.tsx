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
>, 'placeholder' | 'value' | 'defaultValue'> {
  /** 是否勾选（受控，传入即受控模式） */
  checked?: boolean;

  /** 非受控初始勾选态 */
  defaultChecked?: boolean;
}

const RadioInput = forwardRef<HTMLSpanElement, RadioInputProps>(({
  accessKey,
  className,
  disabled,
  name,
  onChange,
  required,
  checked,
  defaultChecked,
  ...rest
}, ref) => {
  const isControlled = checked !== undefined;
  const [innerChecked, setInnerChecked] = useState(!!defaultChecked);
  const isChecked = isControlled ? checked : innerChecked;

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'input', 'radioInput'),
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    if (!isControlled) {
      setInnerChecked(newValue);
    }
    onChange?.(newValue, event);
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
        checked={isChecked}
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
