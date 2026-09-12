import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Dropdown, type DropdownOptionProps } from '../Dropdown';
import { isSelectableOption, type SelectOptionProps } from '../Select';
import { generateWidgetClassName, type ChangeHandler } from '../../utils';
import { useControlledValue, useControlledValueFallback } from '../../hooks';
import type { WidgetProps } from '../Widget';

export type DropdownInputOption = DropdownOptionProps;

type SelectableOption = SelectOptionProps & { value: string | number };

/** 带value的选项（分组判定用；禁用项仍是可选项，只是不可选，故不含disabled判定） */
const hasOptionValue = (option: DropdownInputOption): option is SelectableOption =>
  'value' in option && option.value !== undefined;

export interface DropdownInputProps extends Omit<WidgetProps<HTMLDivElement>, 'children'> {

  /** 选项集：带`value`为可选项，不带的为分组标题（对应隐藏select的optgroup） */
  options: DropdownInputOption[];

  /** 当前选中值（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始选中值 */
  defaultValue?: string | number;

  /** 选中值变更回调 */
  onChange?: ChangeHandler<string | number, HTMLSelectElement>;

  /** 表单提交字段名（落在隐藏的select元素上） */
  name?: string;

  /** 是否必填 */
  required?: boolean;
}

interface OptionGroup {
  /** 分组标题选项，开头无可选项时为undefined */
  section?: DropdownInputOption;
  items: SelectableOption[];
}

/** 将扁平选项按分组标题聚合成optgroup结构 */
const groupOptions = (options: DropdownInputOption[]): OptionGroup[] => {
  const groups: OptionGroup[] = [];
  for (const option of options) {
    if (!hasOptionValue(option)) {
      groups.push({ section: option, items: [] });
    } else {
      const last = groups[groups.length - 1];
      if (last) {
        last.items.push(option);
      } else {
        groups.push({ items: [option] });
      }
    }
  }
  return groups;
};

/**
 * 表单下拉选择，对齐原版OO.ui.DropdownInputWidget：DropdownWidget展示 + 隐藏`<select>`承载
 * 表单提交。value只能是可选项之一，否则回退为第一个可选值（对齐原版setValue的选项校验）
 */
export const DropdownInput = forwardRef<HTMLDivElement, DropdownInputProps>(({
  options,
  className,
  disabled,
  name,
  required,
  value,
  defaultValue,
  onChange,
  ...rest
}, ref) => {
  const { value: currentValue, commit } = useControlledValue<string | number>({ value, defaultValue }, onChange);

  /** 可选值集合；当前值不在其中时回退第一个可选值（无可选值则undefined） */
  const selectableValues = options
    .filter(isSelectableOption)
    .map((option) => option.value);
  const effectiveValue = selectableValues.includes(currentValue) ? currentValue : selectableValues[0];
  // 受控值为非法值时回写回退值，避免父级state与显示值漂移
  useControlledValueFallback(value, effectiveValue, onChange);

  const groups = groupOptions(options);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'input', 'dropdownInput'),
  );

  const renderOption = (option: SelectableOption) => (
    <option
      key={String(option.value)}
      value={String(option.value)}
      disabled={option.disabled}
    >
      {option.children}
    </option>
  );

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      aria-required={required}
      ref={ref}
    >
      {/* 隐藏select仅承载表单提交（wikimediaui主题下display:none），显示交互由Dropdown承担；
          oo-ui-indicator-down对齐原版getInputElement（$( '<select>' ).addClass( 'oo-ui-indicator-down' )） */}
      <select
        className='oo-ui-inputWidget-input oo-ui-indicator-down'
        name={name}
        required={required}
        disabled={disabled}
        value={effectiveValue === undefined ? '' : String(effectiveValue)}
        onChange={(event) => {
          // select的value恒为字符串，映射回选项原值类型再提交，与Dropdown路径一致
          const match = selectableValues.find((v) => String(v) === event.target.value);
          if (match !== undefined) {
            commit(match);
          }
        }}
      >
        {groups.map((group, i) => (
          group.section ? (
            <optgroup
              key={i}
              label={typeof group.section.children === 'string' || typeof group.section.children === 'number'
                ? String(group.section.children)
                : undefined}
              disabled={group.section.disabled}
            >
              {group.items.map(renderOption)}
            </optgroup>
          ) : group.items.map(renderOption)
        ))}
      </select>
      <Dropdown
        options={options}
        disabled={disabled}
        value={effectiveValue}
        onChange={(next) => commit(next)}
      />
    </div>
  );
});

DropdownInput.displayName = 'DropdownInput';

