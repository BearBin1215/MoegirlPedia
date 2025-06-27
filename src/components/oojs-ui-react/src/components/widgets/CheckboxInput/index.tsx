import React, {
  useState,
  forwardRef,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import IconWidget from '../Icon';
import { processClassNames } from '../../../utils/tool';
import type { InputProps } from '../Input';
import type { AccessKeyElement } from '../../../types/mixin';

export type CheckboxInputProps =
  Omit<InputProps<boolean, HTMLSpanElement>, 'ref' | 'defaultChecked'> &
  AccessKeyElement;

const CheckboxInput = forwardRef<HTMLSpanElement, CheckboxInputProps>(({
  name,
  accessKey,
  className,
  disabled,
  onChange,
  defaultValue = false,
  value: controlledValue,
  ...rest
}, ref) => {
  const [value, setValue] = useState(defaultValue);

  const classes = clsx(
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
      className={classes}
      aria-disabled={!!disabled}
      ref={ref}
    >
      <input
        name={name}
        type='checkbox'
        tabIndex={disabled ? -1 : 0}
        accessKey={accessKey}
        aria-disabled={!!disabled}
        className='oo-ui-inputWidget-input'
        checked={controlledValue ?? value}
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
