import React, {
  useState,
  forwardRef,
  useEffect,
  useRef,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import Icon from '../Icon';
import { generateWidgetClassName, type AccessKeyedElement } from '../../utils';
import type { InputProps } from '../Input';

export type CheckboxInputProps =
  InputProps<boolean, HTMLInputElement, HTMLSpanElement> &
  AccessKeyedElement & {
    /** 半选状态 */
    indeterminate?: boolean;
  };

const CheckboxInput = forwardRef<HTMLSpanElement, CheckboxInputProps>(({
  name,
  accessKey,
  className,
  disabled,
  indeterminate,
  required,
  onChange,
  value,
  defaultValue,
  ...rest
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;
  const [innerChecked, setInnerChecked] = useState(!!defaultValue);
  const checked = isControlled ? value : innerChecked;

  // indeterminate不是React受控属性，需手动同步到DOM
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'input', 'checkboxInput'),
  );

  /** 值变更响应 */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    if (!isControlled) {
      setInnerChecked(newValue);
    }
    onChange?.({
      value: newValue,
      oldValue: checked,
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
        ref={inputRef}
        name={name}
        type='checkbox'
        required={required}
        tabIndex={disabled ? -1 : 0}
        accessKey={accessKey}
        aria-disabled={!!disabled}
        className='oo-ui-inputWidget-input'
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
      />
      <Icon
        icon='check'
        className='oo-ui-image-invert'
      />
    </span>
  );
});

CheckboxInput.displayName = 'CheckboxInput';

export default CheckboxInput;
