import React, { useState, forwardRef } from 'react';
import classNames from 'classnames';
import DecoratedOption, { type DecoratedOptionProps } from '../DecoratedOption';
import type { OptionProps } from '../Option';

export interface MenuOptionProps extends
  Omit<DecoratedOptionProps, 'labelProps'>,
  OptionProps { }

/** 选项组件，用于作为`Dropdown`子组件 */
const MenuOption = forwardRef<HTMLDivElement, MenuOptionProps>(({
  disabled,
  selected,
  ...rest
}, ref) => {
  const [pressed, setPressed] = useState(false);
  const [highlighted, setHighlighted] = useState(false);

  const classes = classNames(
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
    <DecoratedOption
      {...rest}
      disabled={disabled}
      className={classes}
      aria-selected={false}
      onMouseUp={handleUnpress}
      onMouseDown={handlePress}
      onMouseLeave={handleUnpress}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      ref={ref}
    />
  );
});

MenuOption.displayName = 'MenuOption';

export default MenuOption;
