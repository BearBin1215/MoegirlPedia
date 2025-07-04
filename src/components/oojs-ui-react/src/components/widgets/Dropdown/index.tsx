import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  type Key,
} from 'react';
import clsx from 'clsx';
import MenuSelect from './MenuSelect';
import type { MenuOptionProps } from '../MenuOption';
import type { MenuSectionOptionProps } from '../MenuSectionOption';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { processClassNames } from '../../../utils/tool';
import type { WidgetProps } from '../Widget';
import type { AccessKeyElement, IconElement, LabelElement } from '../../../types/mixin';
import type { ChangeHandler } from '../../../types/utils';
import type { OptionData } from '../Option';

export type DropdownOptionProps = (MenuOptionProps | MenuSectionOptionProps) & {
  key: Key;
};

export interface DropdownProps extends
  WidgetProps<HTMLDivElement>,
  AccessKeyElement,
  IconElement,
  LabelElement {

  /** 选项集 */
  options: DropdownOptionProps[];

  value?: string | number;

  defaultValue?: string | number;

  onChange?: ChangeHandler<any>;
}

/**
 * @description 下拉选择框组件
 */
const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(({
  className,
  defaultValue,
  disabled,
  icon,
  label,
  onChange,
  options,
  value: controlledValue,
  ...rest
}, ref) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const elementRef = useRef<HTMLDivElement>(null);

  const classes = clsx(
    className,
    processClassNames({
      disabled,
      icon,
      label,
      indicator: 'down',
    }, 'dropdown'),
    open && 'oo-ui-dropdownWidget-open',
  );

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
        oldValue: value,
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
  }, [elementRef]);

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
        className='oo-ui-dropdownWidget-handle'
        role='combobox'
        aria-autocomplete='list'
        aria-expanded={open}
        onClick={handleClickLabel}
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
      />
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;
