import React, {
  forwardRef,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import { getWidgetClassName, resolveTabIndex, resolveTitle } from '../../mixins';
import { useAccessKeyLabel } from '../../config';
import { useControlledValue, useFieldInputId } from '../../hooks';
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

export const RadioInput = forwardRef<HTMLSpanElement, RadioInputProps>(({
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
  // FieldLayout标签联动（通道A）：显式inputId优先，否则认领字段id与label的htmlFor关联
  const fieldInputId = useFieldInputId(inputId);
  // title的键位后缀：快捷键文案由宿主解析（未提供时title附原键值）
  const accessKeyLabel = useAccessKeyLabel(accessKey);

  const classes = clsx(
    className,
    getWidgetClassName({ disabled }, 'input', 'radioInput'),
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
        id={fieldInputId}
        // title/accessKey同落input（原版InputWidget的$titled=$accessKeyed=$input）；
        // 本组件无标签元素，不做invisibleLabel兜底
        title={resolveTitle({ title, accessKey, accessKeyLabel })}
        dir={dir}
        role={role}
        onChange={handleChange}
        required={required}
        aria-disabled={disabled || undefined}
        tabIndex={resolveTabIndex(tabIndex, disabled)}
      />
      {/* 主题以::before/::after在input与span上绘制未选/选中圆点（对齐原版RadioInputWidget的append('<span>')） */}
      <span />
    </span>
  );
});

RadioInput.displayName = 'RadioInput';

