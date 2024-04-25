import React, { useState } from 'react';
import classNames from 'classnames';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
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

  /** 按住鼠标 */
  const handlePress = () => {
    if (!disabled) {
      setPressed(true);
    }
  };

  /** 松开或移出 */
  const handleUnpress = () => {
    if (!disabled) {
      setPressed(false);
    }
  };

  /** 鼠标悬浮 */
  const handleMouseOver = () => {
    if (!disabled) {
      setHighlighted(true);
    }
  };

  /** 鼠标移出 */
  const handleMouseOut = () => {
    if (!disabled) {
      setHighlighted(false);
      setPressed(false);
    }
  };

  return (
    <div
      className={menuOptionClassName}
      aria-disabled={!!disabled}
      tabIndex={-1}
      role='option'
      aria-selected={false}
      onMouseUp={handleUnpress}
      onMouseDown={handlePress}
      onMouseLeave={handleUnpress}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <IconBase icon={icon} />
      <LabelBase role='textbox' aria-readonly>{children}</LabelBase>
      <IndicatorBase indicator={indicator} />
    </div>
  );
};

export default MenuOption;
