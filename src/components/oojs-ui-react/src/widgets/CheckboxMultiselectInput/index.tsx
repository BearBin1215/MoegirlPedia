import React, { forwardRef, useMemo } from 'react';
import clsx from 'clsx';
import { CheckboxMultiselect, type CheckboxMultiselectProps } from '../CheckboxMultiselect';
import { generateWidgetClassName } from '../../utils';

export interface CheckboxMultiselectInputProps extends Omit<CheckboxMultiselectProps, 'className'> {

  /** 附加类 */
  className?: string;
}

/**
 * 表单多选框组，对齐原版OO.ui.CheckboxMultiselectInputWidget：CheckboxMultiselectWidget展示，
 * 各选项checkbox写入name与value承载表单提交。
 * 注意：选项checkbox的`value`由本组件接管（写入选项自身value供表单提交），
 * 调用方传入的`checkboxProps.value`会被覆盖
 */
export const CheckboxMultiselectInput = forwardRef<HTMLDivElement, CheckboxMultiselectInputProps>(({
  options,
  className,
  disabled,
  name,
  value,
  defaultValue,
  onChange,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'input', 'checkboxMultiselectInput'),
  );

  // 注入checkbox提交value的选项集：options每渲染新引用时重算，避免每渲染重建数组与对象
  const mappedOptions = useMemo(
    () => options.map((option) => ({
      ...option,
      // 对齐原版setOptionsData：checkbox写入value供表单提交（name由CheckboxMultiselect透传）
      checkboxProps: { ...option.checkboxProps, value: option.value },
    })),
    [options],
  );

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      <CheckboxMultiselect
        options={mappedOptions}
        disabled={disabled}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
      />
    </div>
  );
});

CheckboxMultiselectInput.displayName = 'CheckboxMultiselectInput';

