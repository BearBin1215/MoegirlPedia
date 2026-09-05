import React, { useState, forwardRef } from 'react';
import clsx from 'clsx';
import DecoratedOption, { type DecoratedOptionProps } from '../DecoratedOption';
import type { OptionProps } from '../Option';

export type MenuOptionProps =
  DecoratedOptionProps &
  OptionProps & {
    /** 是否为鼠标按压中的选项（由Select系父组件拖拽逻辑驱动，对齐原版pressItem） */
    pressed?: boolean;
  };

/** 选项组件，用于作为`Dropdown`子组件 */
const MenuOption = forwardRef<HTMLDivElement, MenuOptionProps>(({
  disabled,
  selected,
  highlighted,
  pressed,
  ...rest
}, ref) => {
  const [hoverHighlighted, setHoverHighlighted] = useState(false);

  const classes = clsx(
    'oo-ui-menuOptionWidget',
    pressed && 'oo-ui-optionWidget-pressed',
    (hoverHighlighted || highlighted) && 'oo-ui-optionWidget-highlighted',
    selected && 'oo-ui-optionWidget-selected',
  );

  const handleMouseOver = () => {
    if (!disabled) {
      setHoverHighlighted(true);
    }
  };

  const handleMouseOut = () => {
    if (!disabled) {
      setHoverHighlighted(false);
    }
  };

  return (
    <DecoratedOption
      {...rest}
      disabled={disabled}
      className={classes}
      aria-selected={!!selected}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      ref={ref}
    />
  );
});

MenuOption.displayName = 'MenuOption';

export default MenuOption;
