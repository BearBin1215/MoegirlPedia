import React, { forwardRef } from 'react';
import clsx from 'clsx';
import Select from '../Select';
import type { SelectProps } from '../Select';
import type { Key } from 'react';

export interface MenuSelectProps extends SelectProps {
  open?: boolean;
  /** 键盘导航当前高亮的选项key */
  highlightedKey?: Key;
}

/**
 * Dropdown组件内包裹的中间组件
 */
const MenuSelect = forwardRef<HTMLDivElement, MenuSelectProps>(({
  className,
  open = false,
  highlightedKey,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    'oo-ui-clippableElement-clippable',
    'oo-ui-floatableElement-floatable',
    'oo-ui-menuSelectWidget',
    !open && 'oo-ui-element-hidden',
  );

  return (
    <Select
      {...rest}
      className={classes}
      highlightedKey={highlightedKey}
      ref={ref}
    />
  );
});

MenuSelect.displayName = 'MenuSelect';

export default MenuSelect;
