import React, { useState, useRef, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import Select from '../Select';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import type { FunctionComponent, MouseEventHandler } from 'react';
import type { WidgetProps } from '../props';
import type { AccessKeyElement, IconElement, LabelElement } from '../mixin';

export interface DropdownProps extends
  WidgetProps<HTMLDivElement>,
  AccessKeyElement,
  IconElement,
  LabelElement {
}

const Dropdown: FunctionComponent<DropdownProps> = ({
  classes,
  children,
  disabled,
  icon,
  label,
  ref,
  ...rest
}) => {
  const [optionsHidden, setOptionsHidden] = useState(true);
  const dropdownRef = ref || useRef<HTMLDivElement>(null);

  const dropdownClassName = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    icon && 'oo-ui-iconElement',
    'oo-ui-indicatorElement',
    label && 'oo-ui-labelElement',
    'oo-ui-dropdownWidget',
  );

  const selectClasses = classNames(
    'oo-ui-clippableElement-clippable',
    'oo-ui-floatableElement-floatable',
    'oo-ui-menuSelectWidget',
    optionsHidden && 'oo-ui-element-hidden',
  );

  /** 点击页面其他地方时关闭下拉菜单 */
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOptionsHidden(true);
    }
  }, []);

  const handleSelect: MouseEventHandler<HTMLDivElement> = () => {
    setOptionsHidden(true);
  };

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
        aria-expanded={false}
        className='oo-ui-dropdownWidget-handle'
        role='combobox'
        aria-autocomplete='list'
        aria-haspopup
        onClick={() => setOptionsHidden(!optionsHidden)}
      >
        <IconBase icon={icon} />
        <span
          className='oo-ui-labelElement-label'
          role='textbox'
          aria-readonly
        >
          {label}
        </span>
        <IndicatorBase indicator='down' />
      </span>
      <Select classes={[selectClasses]} onClick={handleSelect}>
        {children}
      </Select>
    </div>
  );
};

export default Dropdown;