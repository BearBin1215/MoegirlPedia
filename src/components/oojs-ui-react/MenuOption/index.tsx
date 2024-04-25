import React, { useState } from 'react';
import classNames from 'classnames';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import type { FunctionComponent } from 'react';
import type { OptionProps } from '../props';
import type { IconElement, IndicatorElement } from '../mixin';

export interface MenuOptionProps extends
  OptionProps,
  IconElement,
  IndicatorElement { }

const MenuOption: FunctionComponent<MenuOptionProps> = ({
  children,
  disabled,
  icon,
  indicator,
  selected,
}) => {
  const [pressed, setPressed] = useState(false);
  const [highlighted, setHighlighted] = useState(false);

  const menuOptionClassName = classNames(
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-optionWidget',
    icon && 'oo-ui-iconElement',
    indicator && 'oo-ui-indicatorElement',
    'oo-ui-decoratedOptionWidget',
    'oo-ui-menuOptionWidget',
    pressed && 'oo-ui-optionWidget-pressed',
    highlighted && 'oo-ui-optionWidget-highlighted',
    selected && 'oo-ui-optionWidget-selected',
  );

  return (
    <div
      className={menuOptionClassName}
      aria-disabled={false}
      tabIndex={-1}
      role='option'
      aria-selected={false}
      onMouseUp={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseLeave={() => setPressed(false)}
      onMouseOver={() => setHighlighted(true)}
      onMouseOut={() => setHighlighted(false)}
    >
      <IconBase icon={icon} />
      <span
        className='oo-ui-labelElement-label'
        role='textbox'
        aria-readonly
      >
        {children}
      </span>
      <IndicatorBase indicator={indicator} />
    </div>
  );
};

export default MenuOption;
