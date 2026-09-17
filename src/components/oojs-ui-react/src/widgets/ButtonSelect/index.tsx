import React, {
  forwardRef,
  useMemo,
  type KeyboardEventHandler,
} from 'react';
import clsx from 'clsx';
import { ButtonOption, type ButtonOptionProps } from '../ButtonOption';
import {
  getWidgetClassName,
  mergeAriaLabelledBy,
  resolveTabIndex,
} from '../../mixins';
import {
  getSelectableValues,
  resolveOptionDisabled,
  type ChangeHandler,
} from '../../utils';
import {
  useCleanId,
  useControlledValue,
  useFieldLabelFocus,
  useGroupKeyboardSelection,
  useOptionDrag,
  useOptionRegistry,
} from '../../hooks';
import type { WidgetProps } from '../Widget';

export type ButtonSelectOptionProps = ButtonOptionProps;

export interface ButtonSelectProps extends Omit<WidgetProps<HTMLDivElement>, 'onSelect'> {

  /** 选中选项回调函数（值优先） */
  onChange?: ChangeHandler<string | number>;

  /** 当前选中值（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始选中值 */
  defaultValue?: string | number;

  /** 选项集 */
  options: ButtonSelectOptionProps[];
}

/**
 * 按钮式选择组件，对齐原版OO.ui.ButtonSelectWidget：以一排按钮形态呈现互斥选项
 * （选中项即按钮激活态）。
 *
 * 因ButtonOptionWidget不可高亮（原版static.highlightable=false），原版按目标项的该静态值
 * 分流为"直接chooseItem"而非"先highlightItem"：↑↓←→即环绕改选、Enter重申当前项，
 * 故与TabSelect/RadioSelect共用useGroupKeyboardSelection；
 * `aria-activedescendant`指向选中项（对齐原版selectItem对非高亮选项的写入）。
 * 拖拽选择与Select共用useOptionDrag（原版ButtonOptionWidget专门关掉mousedown的
 * preventDefault以放行父级拖拽）
 */
export const ButtonSelect = forwardRef<HTMLDivElement, ButtonSelectProps>(({
  className,
  defaultValue,
  disabled,
  onChange,
  options,
  tabIndex,
  value,
  onKeyDown,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}, ref) => {
  const { value: currentValue, commitIfChanged } = useControlledValue<string | number>({ value, defaultValue }, onChange);
  // 索引注册值：全部选项值（与下方registerItem的调用集合同源，供淘汰已移除选项）
  const optionValues = useMemo(() => options.map((option) => option.value), [options]);
  const { registerItem, findItemFromNode } = useOptionRegistry<string | number>(optionValues);
  // 可选值序列（非禁用项，按展示顺序），键盘导航与拖拽的共用目标集合；Set供O(1)命中
  const selectableValues = useMemo(() => getSelectableValues(options), [options]);
  const selectableValueSet = useMemo(() => new Set(selectableValues), [selectableValues]);
  // FieldLayout标签联动（通道B）：点击标签聚焦容器（对齐原版TabIndexedElement.simulateLabelClick
  // 基线focus()，禁用时不聚焦）
  const { setRef: setRootRef, fieldLabelId } = useFieldLabelFocus<HTMLDivElement>({ ref, disabled });

  /** 值是否可选（在可选值集合内，供拖拽判定） */
  const isValueSelectable = (optionValue: string | number) => selectableValueSet.has(optionValue);

  // 拖拽选择：与Select共用useOptionDrag，提交走commitIfChanged（重复落在已选中项上不派发事件）
  const { pressed, pressedValue, handleMouseDown, handleUnpress } = useOptionDrag<string | number>({
    disabled,
    isValueSelectable,
    findItemFromNode,
    onCommit: commitIfChanged,
  });

  const classes = clsx(
    className,
    getWidgetClassName({ disabled }, 'select', 'buttonSelect'),
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-unpressed',
  );

  // 键盘改选（与TabSelect/RadioSelect共用useGroupKeyboardSelection）：↑↓←→直接改选、Enter重申
  const handleGroupKeyDown = useGroupKeyboardSelection<string | number>({
    disabled,
    selectableValues,
    value: currentValue,
    onCommit: commitIfChanged,
  });

  /** 键盘导航入口：先透传调用方onKeyDown，再处理导航键 */
  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    onKeyDown?.(e);
    handleGroupKeyDown(e);
  };

  const optionIdBase = useCleanId();
  /**
   * 选项元素id（对齐原版OptionWidget.getElementId）：调用方未显式给id时按数组下标生成
   * （useCleanId已去除`:`），供aria-activedescendant指向选中项
   */
  const optionElementId = (index: number) => options[index]?.id ?? `${optionIdBase}-${index}`;
  const selectedIndex = currentValue === undefined
    ? -1
    : options.findIndex((option) => option.value === currentValue);

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      role='listbox'
      aria-multiselectable={false}
      // 本组选项不可高亮，故active descendant指向选中项（对齐原版SelectWidget.selectItem
      // 在非高亮选项上的写入），无选中项时不输出
      aria-activedescendant={selectedIndex >= 0 ? optionElementId(selectedIndex) : undefined}
      aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
      tabIndex={resolveTabIndex(tabIndex, disabled)}
      onKeyDown={handleKeyDown}
      onMouseUp={handleUnpress}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleUnpress}
      ref={setRootRef}
    >
      {options.map((option, i) => (
        <ButtonOption
          {...option}
          id={optionElementId(i)}
          key={option.value}
          ref={registerItem(option.value)}
          disabled={resolveOptionDisabled(option, disabled)}
          selected={currentValue === option.value}
          pressed={pressedValue === option.value}
        >
          {option.children}
        </ButtonOption>
      ))}
    </div>
  );
});

ButtonSelect.displayName = 'ButtonSelect';
