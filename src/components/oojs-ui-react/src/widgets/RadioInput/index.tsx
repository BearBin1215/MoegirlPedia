import React, {
  forwardRef,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import { generateWidgetClassName } from '../../utils';
import { useControlledValue } from '../../hooks';
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

  /** input元素id（配合label的htmlFor使用） */
  inputId?: string;
}

const RadioInput = forwardRef<HTMLSpanElement, RadioInputProps>(({
  name,
  inputId,
  accessKey,
  className,
  disabled,
  onChange,
  required,
  checked,
  defaultChecked,
  title,
  dir,
  tabIndex,
  role,
  ...rest
}, ref) => {
  const { value: isChecked, commit } = useControlledValue<boolean, ChangeEvent<HTMLInputElement>>(
    { value: checked, defaultValue: defaultChecked ?? false },
    onChange,
  );

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'input', 'radioInput'),
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    commit(event.target.checked, event);
  };

  return (
    <span
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      {/* title/dir/tabIndex/accessKey/name等均落在input元素上 */}
      <input
        type='radio'
        className='oo-ui-inputWidget-input'
        accessKey={accessKey}
        disabled={disabled}
        checked={isChecked}
        name={name}
        id={inputId}
        title={title}
        dir={dir}
        role={role}
        onChange={handleChange}
        required={required}
        tabIndex={tabIndex ?? (disabled ? -1 : 0)}
      />
      <span />
    </span>
  );
});

RadioInput.displayName = 'RadioInput';

export default RadioInput;
