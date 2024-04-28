import React, { useState } from 'react';
import classNames from 'classnames';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { processClassNames } from '../utils/tool';
import type { FunctionComponent } from 'react';
import type { OptionProps } from '../types/props';
import type { IconElement, IndicatorElement } from '../types/mixin';

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
  ...rest
}) => {
  const [pressed, setPressed] = useState(false);
  const [highlighted, setHighlighted] = useState(false);

  const classes = classNames(
    processClassNames({
      children,
      disabled,
      label: children,
      icon,
      indicator,
    }, 'option', 'decoratedOption', 'menuOption'),
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
      {...rest}
      className={classes}
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
