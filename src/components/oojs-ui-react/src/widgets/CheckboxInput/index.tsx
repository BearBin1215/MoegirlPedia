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

    /** input元素id（配合label的htmlFor使用），对齐原版inputId */
    inputId?: string;

    /** 半选状态 */
    indeterminate?: boolean;
  };

const CheckboxInput = forwardRef<HTMLSpanElement, CheckboxInputProps>(({
  name,
  inputId,
  accessKey,
  className,
  disabled,
  indeterminate,
  required,
  onChange,
  checked,
  defaultChecked,
  title,
  dir,
  tabIndex,
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
      {/* title/dir/tabIndex/accessKey/name等对齐原版InputWidget：均落在input元素上 */}
      <input
        ref={inputRef}
        name={name}
        id={inputId}
        type='checkbox'
        required={required}
        title={title}
        dir={dir}
        accessKey={accessKey}
        tabIndex={tabIndex ?? (disabled ? -1 : 0)}
        aria-disabled={!!disabled}
        className='oo-ui-inputWidget-input'
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
      />
      <Icon
        icon='check'
        className='oo-ui-checkboxInputWidget-checkIcon oo-ui-image-invert'
      />
    </span>
  );
});

CheckboxInput.displayName = 'CheckboxInput';

export default CheckboxInput;
