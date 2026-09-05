import React, { useRef, forwardRef, type ChangeEvent, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import CheckboxMultioption, { type CheckboxMultioptionProps } from '../CheckboxMultioption';
import { generateWidgetClassName, type ChangeHandler } from '../../utils';
import { useControlledValue } from '../../hooks';
import type { WidgetProps } from '../Widget';

type MultiselectValue = Array<string | number>;

export interface CheckboxMultiselectProps extends WidgetProps {
  options: CheckboxMultioptionProps[];

  /** 表单提交字段名，透传给每个选项的checkbox（对齐原版CheckboxMultiselectInputWidget的name配置） */
  name?: string;

  /** 当前选中值集合（受控，传入即受控模式） */
  value?: MultiselectValue;

  /** 非受控初始选中值集合 */
  defaultValue?: MultiselectValue;

  /** 选中值集合变更时触发，携带完整的值数组 */
  onChange?: ChangeHandler<MultiselectValue, HTMLInputElement>;
}

/** @description 多选框组，对齐原版OO.ui.CheckboxMultiselectWidget：支持Shift+点击范围选择与方向键焦点导航 */
const CheckboxMultiselect = forwardRef<HTMLDivElement, CheckboxMultiselectProps>(({
  options,
  className,
  disabled,
  name,
  value,
  defaultValue,
  onChange,
  ...rest
}, ref) => {
  const { value: currentValue, commit: commitValue } = useControlledValue<MultiselectValue, ChangeEvent<HTMLInputElement>>(
    { value, defaultValue: defaultValue ?? [] },
    onChange,
  );
  // 各选项的checkbox input引用（value → input），供方向键焦点导航聚焦
  const inputRefs = useRef(new Map<string | number, HTMLInputElement>());
  // 上一次点击的选项value，供Shift+点击范围选择的起点定位（对齐原版$lastClicked）
  const lastClickedRef = useRef<string | number | null>(null);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'select', 'checkboxMultiselect'),
  );

  const handleChange = (optionValue: string | number, checked: boolean, event?: ChangeEvent<HTMLInputElement>) => {
    const optionIndex = options.findIndex((o) => o.value === optionValue);
    // 对齐原版onClick：Shift+点击时从上次点击项到当前项的区间（含两端）统一置为当前项翻转后的状态
    if (event?.nativeEvent instanceof window.MouseEvent && event.nativeEvent.shiftKey && lastClickedRef.current !== null) {
      const lastIndex = options.findIndex((o) => o.value === lastClickedRef.current);
      if (lastIndex !== -1 && lastIndex !== optionIndex) {
        const target = !currentValue.includes(optionValue);
        const [start, end] = lastIndex < optionIndex ? [lastIndex, optionIndex] : [optionIndex, lastIndex];
        const nextValue = [...currentValue];
        for (let i = start; i <= end; i++) {
          const option = options[i];
          // 区间内禁用项保持原状（对齐原版isDisabled跳过）
          if (option.disabled) {
            continue;
          }
          const has = nextValue.includes(option.value);
          if (target && !has) {
            nextValue.push(option.value);
          } else if (!target && has) {
            nextValue.splice(nextValue.indexOf(option.value), 1);
          }
        }
        commitValue(nextValue, event);
        lastClickedRef.current = optionValue;
        return;
      }
    }
    lastClickedRef.current = optionValue;
    const nextValue = checked
      ? [...currentValue, optionValue]
      : currentValue.filter((item) => item !== optionValue);
    commitValue(nextValue, event);
  };

  // 对齐原版CheckboxMultioptionWidget.onKeyDown：↑/←上一个、↓/→下一个非禁用项（循环）
  const handleOptionKeyDown = (event: KeyboardEvent<HTMLLabelElement>, optionValue: string | number) => {
    const key = event.key;
    if (key !== 'ArrowUp' && key !== 'ArrowLeft' && key !== 'ArrowDown' && key !== 'ArrowRight') {
      return;
    }
    const direction = key === 'ArrowUp' || key === 'ArrowLeft' ? -1 : 1;
    const len = options.length;
    const currentIndex = options.findIndex((o) => o.value === optionValue);
    let nextIndex = (currentIndex + direction + len) % len;
    for (let i = 0; i < len; i++) {
      const next = options[nextIndex];
      if (next && !next.disabled) {
        inputRefs.current.get(next.value)?.focus();
        break;
      }
      nextIndex = (nextIndex + direction + len) % len;
    }
    event.preventDefault();
  };

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      ref={ref}
    >
      {options.map((option) => {
        const checked = currentValue.includes(option.value);
        return (
          <CheckboxMultioption
            {...option}
            disabled={option.disabled === void 0 ? disabled : option.disabled}
            checked={checked}
            key={option.value}
            name={name}
            inputRef={(node) => {
              if (node) {
                inputRefs.current.set(option.value, node);
              } else {
                inputRefs.current.delete(option.value);
              }
            }}
            onKeyDown={(event) => handleOptionKeyDown(event, option.value)}
            onChange={(checkedState, event) => {
              option.onChange?.(checkedState, event);
              handleChange(option.value, checkedState, event);
            }}
          />
        );
      })}
    </div>
  );
});

CheckboxMultiselect.displayName = 'CheckboxMultiselect';

export default CheckboxMultiselect;
