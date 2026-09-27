import React, { forwardRef, type Ref } from 'react';
import clsx from 'clsx';
import { LabelBase } from '../Label/Base';
import { CheckboxInput, type CheckboxInputProps } from '../CheckboxInput';
import { getWidgetClassName } from '../../mixins';
import type { ChangeHandler } from '../../utils';
import type { OptionProps } from '../Option';

export interface CheckboxMultioptionProps extends Omit<OptionProps<HTMLLabelElement>, 'highlighted'> {
  /** 表单提交字段名，透传给内部CheckboxInput */
  name?: string;

  onChange?: ChangeHandler<boolean, HTMLInputElement>;

  /** 获取内部checkbox input引用（如方向键焦点导航聚焦用） */
  inputRef?: Ref<HTMLInputElement>;

  /** 透传给内部CheckboxInput的其余属性（如inputId） */
  checkboxProps?: Omit<CheckboxInputProps, 'checked' | 'onChange' | 'disabled'>;
}

export const CheckboxMultioption = forwardRef<HTMLLabelElement, CheckboxMultioptionProps>(({
  accessKey,
  className,
  disabled,
  children,
  name,
  selected,
  onChange,
  inputRef,
  checkboxProps,
  value: _value,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    // 对齐原版CheckboxMultioptionWidget继承的MultioptionWidget（根基类oo-ui-multioptionWidget、
    // 选中态为oo-ui-multioptionWidget-selected，与OptionWidget系不同）
    getWidgetClassName({ disabled, label: children }, 'multioption', 'checkboxMultioption'),
    selected && 'oo-ui-multioptionWidget-selected',
  );

  return (
    <label
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      tabIndex={-1}
      role='checkbox'
      aria-checked={!!selected}
      ref={ref}
    >
      <CheckboxInput
        {...checkboxProps}
        accessKey={accessKey}
        disabled={disabled}
        name={name}
        checked={selected}
        onChange={onChange}
        inputRef={inputRef}
      />
      <LabelBase>{children}</LabelBase>
    </label>
  );
});

CheckboxMultioption.displayName = 'CheckboxMultioption';

