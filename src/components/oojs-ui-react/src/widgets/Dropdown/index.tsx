import React, {
  useState,
  useMemo,
  useRef,
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { IndicatorBase } from '../Indicator/Base';
import { LabelBase } from '../Label/Base';
import {
  getSelectableValues,
  getWidgetClassName,
  mergeAriaLabelledBy,
  resolveTabIndex,
  type AccessKeyedElement,
  type ChangeHandler,
} from '../../utils';
import { useCleanId, useControlledValue, useFieldLabelActivate, useMenuPopup, useMergedRefs } from '../../hooks';
import type { WidgetProps } from '../Widget';
import type { LabelElement } from '../Label';
import type { IconElement } from '../Icon';
import type { SelectOptionProps } from '../Select';
import { MenuSelect } from '../MenuSelect';
export type DropdownOptionProps = SelectOptionProps;

export interface DropdownProps extends
  WidgetProps<HTMLDivElement>,
  AccessKeyedElement,
  IconElement,
  LabelElement {

  /** 选项集 */
  options: DropdownOptionProps[];

  /** 当前选中值（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始选中值 */
  defaultValue?: string | number;

  onChange?: ChangeHandler<string | number>;
}

/**
 * 下拉选择框组件
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(({
  className,
  disabled,
  icon,
  label,
  onChange,
  options,
  value,
  defaultValue,
  // tabIndex落在handle上（对齐原版DropdownWidget的$tabIndexed=$handle，根元素不可聚焦）
  tabIndex,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}, ref) => {
  const [open, setOpen] = useState(false);
  const { value: currentValue, commit } = useControlledValue<string | number>({ value, defaultValue }, onChange);
  const elementRef = useRef<HTMLDivElement>(null);
  // 菜单面板经MenuSelect portal至body，点击外部关闭时需连同菜单一起排除
  const menuRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(elementRef, ref);
  // FieldLayout标签联动（通道B）：点击标签聚焦handle（对齐原版TabIndexedElement.simulateLabelClick
  // 基线focus()，禁用时不聚焦）
  const fieldLabelId = useFieldLabelActivate(() => {
    if (!disabled) {
      elementRef.current?.querySelector<HTMLElement>('.oo-ui-dropdownWidget-handle')?.focus();
    }
  });
  // handle内label元素id：原版DropdownWidget构造期setLabelId并把它并入handle的
  // aria-labelledby，使combobox的可访问名称为字段label+当前显示文本
  const ownLabelId = useCleanId();

  const classes = clsx(
    className,
    getWidgetClassName({
      disabled,
      icon,
      label,
      indicator: 'down',
    }, 'dropdown'),
    open && 'oo-ui-dropdownWidget-open',
  );

  /** 可选项（有value且未禁用），键盘导航的目标集合；Set供Enter分支O(1)校验高亮值 */
  const selectableValues = useMemo(() => getSelectableValues(options), [options]);
  const selectableValueSet = useMemo(() => new Set(selectableValues), [selectableValues]);

  // 菜单开合与键盘高亮：端点钳制不环绕（原版MenuSelectWidget static.listWrapsAround=false），
  // 开启时点击外部/Escape关闭（Escape捕获阶段，嵌套于Dialog时不误关弹窗）。
  // 高亮与Select共用（含鼠标悬停），经onHighlightedChange回写；
  // 导航键（↑↓/Home/End/PageUp/PageDown）统一走handleNavigationKey
  const {
    highlightedValue,
    setHighlightedValue,
    handleNavigationKey,
  } = useMenuPopup<string | number>({
    open,
    onClose: () => setOpen(false),
    values: selectableValues,
    ignore: [elementRef, menuRef],
  });

  /** 选中指定选项并关闭菜单（非受控时同步内部state） */
  const selectOption = (optionValue: string | number) => {
    commit(optionValue);
    setOpen(false);
  };

  /** handle键盘导航，对齐原版DropdownWidget.onKeyDown（Enter/Space开合）与SelectWidget键盘选择 */
  const handleKeyDown = (ev: ReactKeyboardEvent) => {
    if (disabled) {
      return;
    }
    switch (ev.key) {
      case 'Enter':
      case ' ':
        ev.preventDefault();
        if (!open) {
          setOpen(true);
        } else if (highlightedValue !== undefined && selectableValueSet.has(highlightedValue)) {
          selectOption(highlightedValue);
        }
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        // 收起时方向键仅展开（对齐原版onKeyDown），展开后才移动高亮
        ev.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          handleNavigationKey(ev.key);
        }
        break;
      case 'Home':
      case 'End':
      case 'PageUp':
      case 'PageDown':
        // 仅菜单展开时占用按键；±10翻页步长与首末跳转由handleNavigationKey统一
        if (open && handleNavigationKey(ev.key)) {
          ev.preventDefault();
        }
        break;
    }
  };

  /** 点击handle开合菜单（对齐原版DropdownWidget.onClick的toggle语义，禁用时不响应） */
  const handleClickLabel = () => {
    if (!disabled) {
      setOpen((prev) => !prev);
    }
  };

  /** 如果有选中的则显示已选，没选则显示label */
  const displayLabel = options.find((option) => 'value' in option && option.value === currentValue)?.children ?? label;

  return (
    <div
      {...rest}
      className={classes}
      ref={mergedRef}
    >
      <span
        tabIndex={resolveTabIndex(tabIndex, disabled)}
        aria-disabled={disabled || undefined}
        aria-haspopup='listbox'
        className='oo-ui-dropdownWidget-handle'
        role='combobox'
        aria-autocomplete='list'
        aria-expanded={open}
        // aria-labelledby落在handle：原版$tabIndexed=$handle且setLabelledBy覆写写$handle，
        // 并入handle内label元素id（构造期setLabelId分配）使名称含当前显示文本
        aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ownLabelId, ariaLabelledBy)}
        onClick={handleClickLabel}
        onKeyDown={handleKeyDown}
      >
        <IconBase icon={icon} />
        <LabelBase id={ownLabelId} role='textbox' aria-readonly>{displayLabel}</LabelBase>
        <IndicatorBase indicator='down' />
      </span>
      <MenuSelect
        ref={menuRef}
        container={elementRef}
        onChange={selectOption}
        value={currentValue}
        open={open}
        options={options}
        highlightedValue={highlightedValue}
        onHighlightedChange={setHighlightedValue}
      />
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

