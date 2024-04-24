import React, { useState } from 'react';
import classNames from 'classnames';
import Select from '../Select';
import type { FunctionComponent } from 'react';
import type { WidgetProps, MenuOptionProps } from '../props';
import type { AccessKeyElement, IconElement, LabelElement } from '../mixin';

export interface DropdownProps extends
  WidgetProps<HTMLInputElement>,
  AccessKeyElement,
  IconElement,
  LabelElement {

  items?: MenuOptionProps[];
}

const Dropdown: FunctionComponent<DropdownProps> = ({
  classes,
  children,
  disabled,
  icon,
  label,
  ...rest
}) => {
  const [optionsHidden, setOptionsHidden] = useState(true);

  const dropdownClassName = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    icon && 'oo-ui-iconElement',
    'oo-ui-indicatorElement',
    label && 'oo-ui-labelElement',
    'oo-ui-dropdownWidget',
  );

  const iconClassName = classNames(
    'oo-ui-iconElement-icon',
    icon ? `oo-ui-icon-${icon}` : 'oo-ui-iconElement-noIcon',
  );

  const selectClasses = classNames(
    'oo-ui-clippableElement-clippable',
    'oo-ui-floatableElement-floatable',
    'oo-ui-menuSelectWidget',
    optionsHidden && 'oo-ui-element-hidden',
  );

  return (
    <div className={dropdownClassName} {...rest}>
      <span
        aria-expanded={false}
        className='oo-ui-dropdownWidget-handle'
        role='combobox'
        aria-autocomplete='list'
        aria-haspopup
        onClick={() => setOptionsHidden(!optionsHidden)}
      >
        <span className={iconClassName} />
        <span
          className='oo-ui-labelElement-label'
          role='textbox'
          aria-readonly
        >
          {label}
        </span>
        <span className='oo-ui-indicatorElement-indicator oo-ui-indicator-down' />
      </span>
      <Select classes={[selectClasses]}>
        {children}
      </Select>
    </div>
  );
};

export default Dropdown;
