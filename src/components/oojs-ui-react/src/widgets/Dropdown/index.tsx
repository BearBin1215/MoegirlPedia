import React, {
  useState,
  useRef,
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { IndicatorBase } from '../Indicator/Base';
import { LabelBase } from '../Label/Base';
import {
  generateWidgetClassName,
  type AccessKeyedElement,
  type ChangeHandler,
} from '../../utils';
import { useControlledValue, useMenuPopup, useMergedRefs } from '../../hooks';
import type { WidgetProps } from '../Widget';
import type { LabelElement } from '../Label';
import type { IconElement } from '../Icon';
import type { SelectOptionProps } from '../Select';
import { isSelectableOption } from '../Select';
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
  ...rest
}, ref) => {
  const [open, setOpen] = useState(false);
  const { value: currentValue, commit } = useControlledValue<string | number>({ value, defaultValue }, onChange);
  const elementRef = useRef<HTMLDivElement>(null);
  // 菜单面板经MenuSelect portal至body，点击外部关闭时需连同菜单一起排除
  const menuRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(elementRef, ref);

  const classes = clsx(
    className,
    generateWidgetClassName({
      disabled,
      icon,
      label,
      indicator: 'down',
    }, 'dropdown'),
    open && 'oo-ui-dropdownWidget-open',
  );

  /** 可选项（有value且未禁用），键盘导航的目标集合 */
  const selectableOptions = options.filter(isSelectableOption);
  const selectableValues = selectableOptions.map((o) => o.value);

  // 菜单开合与键盘高亮：端点钳制不环绕（原版MenuSelectWidget static.listWrapsAround=false），
  // 开启时点击外部/Escape关闭（Escape捕获阶段，嵌套于Dialog时不误关弹窗）。
  // 高亮与Select共用（含鼠标悬停），经onHighlightedChange回写
  const {
    highlightedValue,
    setHighlightedValue,
    moveHighlight,
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
        } else {
          const highlighted = selectableOptions.find((o) => o.value === highlightedValue);
          if (highlighted) {
            selectOption(highlighted.value);
          }
        }
        break;
      case 'ArrowDown':
        ev.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          moveHighlight(1);
        }
        break;
      case 'ArrowUp':
        ev.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          moveHighlight(-1);
        }
        break;
      case 'Home':
        if (open && selectableOptions.length) {
          ev.preventDefault();
          setHighlightedValue(selectableOptions[0].value);
        }
        break;
      case 'End':
        if (open && selectableOptions.length) {
          ev.preventDefault();
          setHighlightedValue(selectableOptions[selectableOptions.length - 1].value);
        }
        break;
      case 'PageUp':
        if (open && selectableOptions.length) {
          ev.preventDefault();
          moveHighlight(-10);
        }
        break;
      case 'PageDown':
        if (open && selectableOptions.length) {
          ev.preventDefault();
          moveHighlight(10);
        }
        break;
    }
  };

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
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-haspopup='listbox'
        className='oo-ui-dropdownWidget-handle'
        role='combobox'
        aria-autocomplete='list'
        aria-expanded={open}
        onClick={handleClickLabel}
        onKeyDown={handleKeyDown}
      >
        <IconBase icon={icon} />
        <LabelBase role='textbox' aria-readonly>{displayLabel}</LabelBase>
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

