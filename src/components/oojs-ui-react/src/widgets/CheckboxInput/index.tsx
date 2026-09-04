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
  Omit<InputProps<boolean, HTMLInputElement, HTMLSpanElement>, 'value' | 'defaultValue'> &
  AccessKeyedElement & {
    /** 是否勾选（受控，传入即受控模式） */
    checked?: boolean;

    /** 非受控初始勾选态 */
    defaultChecked?: boolean;

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
  checked,
  defaultChecked,
  ...rest
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = checked !== undefined;
  const [innerChecked, setInnerChecked] = useState(!!defaultChecked);
  const isChecked = isControlled ? checked : innerChecked;

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
        ref={inputRef}
        name={name}
        type='checkbox'
        required={required}
        tabIndex={disabled ? -1 : 0}
        accessKey={accessKey}
        aria-disabled={!!disabled}
        className='oo-ui-inputWidget-input'
        checked={isChecked}
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
