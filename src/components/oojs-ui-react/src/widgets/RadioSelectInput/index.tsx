import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { RadioSelect } from '../RadioSelect';
import { type RadioOptionProps } from '../RadioOption';
import { generateWidgetClassName, type ChangeHandler } from '../../utils';
import { useControlledValue, useControlledValueFallback } from '../../hooks';
import type { WidgetProps } from '../Widget';

export interface RadioSelectInputProps extends Omit<WidgetProps<HTMLDivElement>, 'children'> {

  /** 选项集 */
  options: RadioOptionProps[];

  /** 当前选中值（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始选中值 */
  defaultValue?: string | number;

  /** 选中值变更回调 */
  onChange?: ChangeHandler<string | number, HTMLInputElement>;

  /** 表单提交字段名（仅落在隐藏input上；radio本身不带name，组内互斥由受控状态保证） */
  name?: string;
}

/**
 * 表单单选组，对齐原版OO.ui.RadioSelectInputWidget：RadioSelectWidget展示 + 隐藏`<input>`承载
 * 表单提交。value只能是可选项之一，否则回退为第一个可选值（对齐原版setValue的选项校验），
 * 故与RadioSelect不同，组件始终存在选中项（与HTML radio表单语义一致）
 */
export const RadioSelectInput = forwardRef<HTMLDivElement, RadioSelectInputProps>(({
  options,
  className,
  disabled,
  name,
  value,
  defaultValue,
  onChange,
  ...rest
}, ref) => {
  const { value: currentValue, commit } = useControlledValue<string | number>({ value, defaultValue }, onChange);

  /** 可选值集合；当前值不在其中时回退第一个可选值（无可选值则undefined） */
  const selectableValues = options
    .filter((option) => !option.disabled)
    .map((option) => option.value);
  const effectiveValue = selectableValues.includes(currentValue) ? currentValue : selectableValues[0];
  // 受控值为非法值时回写回退值，避免父级state与显示值漂移（对齐原版setValue的回退写入）
  useControlledValueFallback(value, effectiveValue, onChange);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'input', 'radioSelectInput'),
  );

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      {/* 承载表单提交的隐藏input，显示交互由RadioSelect承担。
          不用type="hidden"：原版getInputElement明确注明隐藏input无法分离value/defaultValue
          （InputWidget依赖defaultValue），故以oo-ui-element-hidden类隐藏；
          禁用时对input设disabled（原版setDisabled作用于$input，禁用字段不参与提交） */}
      <input
        className='oo-ui-inputWidget-input oo-ui-element-hidden'
        name={name}
        value={effectiveValue === undefined ? '' : String(effectiveValue)}
        disabled={disabled}
      />
      <RadioSelect
        options={options}
        disabled={disabled}
        value={effectiveValue}
        onChange={(next) => {
          if (next !== undefined) {
            commit(next);
          }
        }}
      />
    </div>
  );
});

RadioSelectInput.displayName = 'RadioSelectInput';

