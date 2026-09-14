import React, {
  forwardRef,
  useLayoutEffect,
  useMemo,
  useRef,
  type KeyboardEventHandler,
} from 'react';
import clsx from 'clsx';
import { TabOption, type TabOptionProps } from '../TabOption';
import { getSelectableValues, getWidgetClassName, resolveTabIndex, type ChangeHandler } from '../../utils';
import { useControlledValue, useGroupKeyboardSelection, useMergedRefs, useOptionDrag, useOptionRegistry } from '../../hooks';
import { useIsMobile } from '../../config';
import type { WidgetProps } from '../Widget';

export type TabSelectOptionProps = TabOptionProps;

export interface TabSelectProps extends Omit<WidgetProps<HTMLDivElement>, 'onSelect'> {
  /** 是否有边框 */
  framed?: boolean;

  /** 当前选中值（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始选中值 */
  defaultValue?: string | number;

  /** 选项集 */
  options: TabSelectOptionProps[];

  /** 选中选项回调函数（值优先） */
  onChange?: ChangeHandler<string | number>;
}

/** 选项卡选择组件，对齐原版`TabSelectWidget`（role=tablist，聚焦后←→环绕选择） */
export const TabSelect = forwardRef<HTMLDivElement, TabSelectProps>(({
  className,
  framed = true,
  value,
  defaultValue,
  options,
  onChange,
  disabled,
  tabIndex,
  onKeyDown,
  ...rest
}, ref) => {
  const isMobile = useIsMobile();
  const { value: currentValue, commitIfChanged } = useControlledValue<string | number>({ value, defaultValue }, onChange);
  // 索引注册值：全部选项值（与下方registerItem的调用集合同源，供淘汰已移除选项）
  const optionValues = useMemo(() => options.map((option) => option.value), [options]);
  const { itemRefs, registerItem, findItemFromNode } = useOptionRegistry<string | number>(optionValues);
  const rootRef = useRef<HTMLDivElement>(null);
  const setRootRef = useMergedRefs(ref, rootRef);
  // 可选值序列（非禁用项，按展示顺序），键盘导航与拖拽的共用目标集合；Set供O(1)命中
  const selectableValues = useMemo(() => getSelectableValues(options), [options]);
  const selectableValueSet = useMemo(() => new Set(selectableValues), [selectableValues]);

  const isValueSelectable = (optionValue: string | number) => selectableValueSet.has(optionValue);

  // 拖拽选择：提交走commitIfChanged（点击已选中页签不重复派发onChange，对齐原版selectItem
  // 对已选中项的提前返回）；禁用态由useOptionDrag自身拦截
  const { pressed, pressedValue, handleMouseDown, handleUnpress } = useOptionDrag<string | number>({
    disabled,
    isValueSelectable,
    findItemFromNode,
    onCommit: commitIfChanged,
  });

  const classes = clsx(
    className,
    getWidgetClassName({ disabled }, 'select', 'tabSelect'),
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-unpressed',
    framed ? 'oo-ui-tabSelectWidget-framed' : 'oo-ui-tabSelectWidget-frameless',
    isMobile && 'oo-ui-tabSelectWidget-mobile',
  );

  // 选中项变化时滚动到可见区（对齐原版TabOptionWidget.scrollIntoViewOnSelect=true）：
  // 页签集横向溢出时使新选中项进入视野；itemRefs读取最新元素，无需列入依赖。
  // 移动端对齐原版scrollElementIntoView的居中分支：按容器与页签宽度差计算左右padding，
  // 经scroll-margin实现等效的"带内边距滚动"（nearest对齐+对称边距=居中，滚动到边界时自然钳制）
  useLayoutEffect(() => {
    if (currentValue === undefined) {
      return;
    }
    const option = itemRefs.current.get(currentValue);
    if (!option) {
      return;
    }
    const group = rootRef.current;
    if (isMobile && group) {
      const padding = Math.max((group.clientWidth - option.clientWidth) / 2, 0);
      option.style.scrollMargin = `0 ${padding}px`;
      option.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      option.style.scrollMargin = '';
      return;
    }
    option.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [currentValue, isMobile, itemRefs]);

  // 键盘改选（与RadioSelect共用useGroupKeyboardSelection，对齐原版经
  // SelectWidget.onDocumentKeyDown的绑定形态）：tablist聚焦后←→/↑↓环绕选择、Enter确认。
  // 选项元素均tabIndex=-1，焦点始终落在组根，React事件即覆盖全部按键目标
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

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      role='tablist'
      tabIndex={resolveTabIndex(tabIndex, disabled)}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onMouseUp={handleUnpress}
      onMouseLeave={handleUnpress}
      ref={setRootRef}
    >
      {options.map((option) => (
        <TabOption
          {...option}
          key={option.value}
          ref={registerItem(option.value)}
          selected={currentValue === option.value}
          pressed={pressedValue === option.value}
        >
          {option.children}
        </TabOption>
      ))}
    </div>
  );
});

TabSelect.displayName = 'TabSelect';

