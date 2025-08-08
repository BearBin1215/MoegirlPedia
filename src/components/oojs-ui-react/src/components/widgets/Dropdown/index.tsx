import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  type Key,
} from 'react';
import clsx from 'clsx';
import type { MenuOptionProps } from '../MenuOption';
import type { MenuSectionOptionProps } from '../MenuSectionOption';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { generateWidgetClassName } from '../../../utils/tool';
import type { WidgetProps } from '../Widget';
import type { AccessKeyedElement, ChangeHandler } from '../../mixins';
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

  onChange?: ChangeHandler<any>;
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
