import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  type Key,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import clsx from 'clsx';
import type { MenuOptionProps } from '../MenuOption';
import type { MenuSectionOptionProps } from '../MenuSectionOption';
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
import type { OptionData } from '../Option';
import MenuSelect from './MenuSelect';

export type DropdownOptionProps = (MenuOptionProps | MenuSectionOptionProps) & {
  key: Key;
};

export interface DropdownProps extends
  WidgetProps<HTMLDivElement>,
  AccessKeyedElement,
  IconElement,
  LabelElement {

  /** 选项集 */
  options: DropdownOptionProps[];

  value?: string | number;

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
  ...rest
}, ref) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | number | undefined>();
  const [highlightedKey, setHighlightedKey] = useState<Key>();
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

  /** 可选项（有data且未禁用），键盘导航的目标集合 */
  const selectableOptions = options.filter(
    (option): option is DropdownOptionProps & { data: string | number } => 'data' in option && !option.disabled,
  );

  /** 移动键盘高亮项（循环） */
  const moveHighlight = (delta: 1 | -1) => {
    const keys = selectableOptions.map((o) => o.key);
    if (!keys.length) {
      return;
    }
    const currentIndex = highlightedKey === undefined ? -1 : keys.indexOf(highlightedKey);
    const nextIndex = currentIndex === -1
      ? (delta === 1 ? 0 : keys.length - 1)
      : (currentIndex + delta + keys.length) % keys.length;
    setHighlightedKey(keys[nextIndex]);
  };

  /** 选中指定选项并关闭菜单 */
  const selectOption = (option: DropdownOptionProps & { data: string | number }) => {
    if (typeof onChange === 'function') {
      onChange({
        value: option.data,
        oldValue: controlledValue ?? value,
      });
    }
    setValue(option.data);
    setOpen(false);
  };

  /** handle键盘导航，对齐原版DropdownWidget.onKeyDown（Enter/Space开合）与SelectWidget键盘选择 */
  const handleHandleKeyDown = (ev: ReactKeyboardEvent) => {
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
          const highlighted = selectableOptions.find((o) => o.key === highlightedKey);
          if (highlighted) {
            selectOption(highlighted);
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
          setHighlightedKey(selectableOptions[0].key);
        }
        break;
      case 'End':
        if (open && selectableOptions.length) {
          ev.preventDefault();
          setHighlightedKey(selectableOptions[selectableOptions.length - 1].key);
        }
        break;
    }
  };

  const handleClickLabel = () => {
    if (!disabled) {
      setOpen(!open);
    }
  };

  /** 选择后回调 */
  const handleSelect = (option: OptionData) => {
    if (typeof onChange === 'function') {
      onChange({
        value: option.data,
        oldValue: controlledValue ?? value,
      });
    }
    setValue(option.data);
    setOpen(false);
  };

  /** 如果有选中的则显示已选，没选则显示label */
  const displayLabel = options.find((option) => {
    return 'data' in option && option.data === (controlledValue ?? value);
  })?.children || label;

  useEffect(() => {
    /** 点击页面其他地方时关闭下拉菜单 */
    const handleClickOutside = (event: MouseEvent) => {
      if (elementRef.current && !elementRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    /** 按下ESC时关闭下拉菜单 */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && elementRef.current) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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
        onKeyDown={handleHandleKeyDown}
      >
        <IconBase icon={icon} />
        <LabelBase role='textbox' aria-readonly>{displayLabel}</LabelBase>
        <IndicatorBase indicator='down' />
      </span>
      <MenuSelect
        onSelect={handleSelect}
        value={controlledValue ?? value}
        open={open}
        options={options}
        highlightedKey={highlightedKey}
      />
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;
