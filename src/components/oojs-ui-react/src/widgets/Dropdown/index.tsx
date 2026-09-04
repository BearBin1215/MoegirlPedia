import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import clsx from 'clsx';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import {
  generateWidgetClassName,
  type AccessKeyedElement,
  type ChangeHandler,
} from '../../utils';
import type { WidgetProps } from '../Widget';
import type { LabelElement } from '../Label';
import type { IconElement } from '../Icon';
import type { SelectOptionProps } from '../Select';
import MenuSelect from '../MenuSelect';

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
 * @description 下拉选择框组件
 */
const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(({
  className,
  disabled,
  icon,
  label,
  onChange,
  options,
  value: controlledValue,
  defaultValue,
  ...rest
}, ref) => {
  const [open, setOpen] = useState(false);
  const isControlled = controlledValue !== undefined;
  const [innerValue, setInnerValue] = useState<string | number | undefined>(defaultValue);
  const currentValue = isControlled ? controlledValue : innerValue;
  const [highlightedValue, setHighlightedValue] = useState<string | number>();
  const elementRef = useRef<HTMLDivElement>(null);

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
  const selectableOptions = options.filter(
    (option): option is DropdownOptionProps & { value: string | number } => 'value' in option && !option.disabled,
  );

  /** 移动键盘高亮项（循环） */
  const moveHighlight = (delta: 1 | -1) => {
    const values = selectableOptions.map((o) => o.value);
    if (!values.length) {
      return;
    }
    const currentIndex = highlightedValue === undefined ? -1 : values.indexOf(highlightedValue);
    const nextIndex = currentIndex === -1
      ? (delta === 1 ? 0 : values.length - 1)
      : (currentIndex + delta + values.length) % values.length;
    setHighlightedValue(values[nextIndex]);
  };

  /** 选中指定选项并关闭菜单（非受控时同步内部state） */
  const selectOption = (value: string | number) => {
    onChange?.(value);
    if (!isControlled) {
      setInnerValue(value);
    }
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
    }
  };

  const handleClickLabel = () => {
    if (!disabled) {
      setOpen(!open);
    }
  };

  /** 如果有选中的则显示已选，没选则显示label */
  const displayLabel = options.find((option) => 'value' in option && option.value === currentValue)?.children ?? label;

  useEffect(() => {
    /** 点击页面其他地方时关闭下拉菜单 */
    const handleClickOutside = (event: MouseEvent) => {
      if (elementRef.current && !elementRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    /** 按下ESC时关闭下拉菜单 */
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && elementRef.current) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useImperativeHandle(ref, () => elementRef.current!);

  return (
    <div
      {...rest}
      className={classes}
      ref={elementRef}
    >
      <span
        tabIndex={disabled ? -1 : 0}
        aria-disabled={!!disabled}
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
        onChange={selectOption}
        value={currentValue}
        open={open}
        options={options}
        highlightedValue={highlightedValue}
      />
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;
