import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import Select from '../Select';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../props';
import type { AccessKeyElement, IconElement, LabelElement } from '../mixin';
import type { ChangeHandler } from '../utils';
import type { OptionData } from '../Option';
import type { OptionElement } from '../Select';

export interface DropdownProps extends
  WidgetProps<HTMLDivElement>,
  AccessKeyElement,
  IconElement,
  LabelElement {

  defaultValue?: any;

  children?: OptionElement | OptionElement[];

  onChange?: ChangeHandler<any>;
}

const Dropdown: FunctionComponent<DropdownProps> = ({
  classes,
  children,
  defaultValue,
  disabled,
  icon,
  label,
  onChange,
  ref,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const dropdownRef = ref || useRef<HTMLDivElement>(null);

  const options = useMemo(() => {
    let optionElements: OptionElement[] = [];
    if (children) {
      optionElements = Array.isArray(children) ? children : [children]; // 确保子组件为数组
    }
    return optionElements;
  }, [children, value]);

  const dropdownClassName = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    icon && 'oo-ui-iconElement',
    'oo-ui-indicatorElement',
    label && 'oo-ui-labelElement',
    'oo-ui-dropdownWidget',
    open && 'oo-ui-dropdownWidget-open',
  );

  const selectClasses = classNames(
    'oo-ui-clippableElement-clippable',
    'oo-ui-floatableElement-floatable',
    'oo-ui-menuSelectWidget',
    !open && 'oo-ui-element-hidden',
  );

  const handleClickLabel = () => setOpen(!open);

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

  /** 点击页面其他地方时关闭下拉菜单 */
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  }, []);

  /** 如果有选中的则显示已选，没选则显示label */
  const displayLabel = options.find((option) => {
    return 'data' in option.props && option.props.data === value;
  })?.props.children || label;

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      {...rest}
      className={dropdownClassName}
      ref={dropdownRef}
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
      <Select classes={selectClasses} onSelect={handleSelect} value={value}>
        {children}
      </Select>
    </div>
  );
};

export default Dropdown;
