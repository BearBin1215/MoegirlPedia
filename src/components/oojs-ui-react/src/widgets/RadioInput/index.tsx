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
  /** 是否选中（受控，传入即受控模式） */
  selected?: boolean;

  /** 非受控初始选中态 */
  defaultSelected?: boolean;
}

const RadioInput = forwardRef<HTMLSpanElement, RadioInputProps>(({
  accessKey,
  className,
  disabled,
  name,
  onChange,
  required,
  selected,
  defaultSelected,
  ...rest
}, ref) => {
  const isControlled = selected !== undefined;
  const [innerSelected, setInnerSelected] = useState(!!defaultSelected);
  const checked = isControlled ? selected : innerSelected;

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'input', 'radioInput'),
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const oldValue = checked;
    const value = event.target.checked;
    if (!isControlled) {
      setInnerSelected(value);
    }
    onChange?.({
      value,
      oldValue,
      event,
    });
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
        checked={checked}
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
