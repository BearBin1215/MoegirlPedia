import React, { forwardRef, type Ref } from 'react';
import clsx from 'clsx';
import LabelBase from '../Label/Base';
import CheckboxInput, { type CheckboxInputProps } from '../CheckboxInput';
import { generateWidgetClassName, type ChangeHandler } from '../../utils';
import type { OptionProps } from '../Option';

export interface CheckboxMultioptionProps extends Omit<OptionProps<HTMLLabelElement>, 'highlighted'> {
  /** 是否勾选 */
  checked?: boolean;

  /** 表单提交字段名，透传给内部CheckboxInput */
  name?: string;

  onChange?: ChangeHandler<boolean, HTMLInputElement>;

  /** 获取内部checkbox input引用（如方向键焦点导航聚焦用） */
  inputRef?: Ref<HTMLInputElement>;

  /** 透传给内部CheckboxInput的其余属性（如inputId） */
  checkboxProps?: Omit<CheckboxInputProps, 'checked' | 'onChange' | 'disabled'>;
}

const CheckboxMultioption = forwardRef<HTMLLabelElement, CheckboxMultioptionProps>(({
  accessKey,
  className,
  disabled,
  children,
  name,
  checked,
  onChange,
  inputRef,
  checkboxProps,
  value: _value,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, label: children }, 'option', 'checkboxMultioption'),
    checked && 'oo-ui-optionWidget-selected',
  );

  return (
    <label
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      tabIndex={-1}
      role='checkbox'
      aria-checked={!!checked}
      ref={ref}
    >
      <CheckboxInput
        {...checkboxProps}
        accessKey={accessKey}
        disabled={disabled}
        name={name}
        checked={checked}
        onChange={onChange}
        inputRef={inputRef}
      />
      <LabelBase>{children}</LabelBase>
    </label>
  );
});

CheckboxMultioption.displayName = 'CheckboxMultioption';

export default CheckboxMultioption;
