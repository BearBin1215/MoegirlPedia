import React, { forwardRef } from 'react';
import clsx from 'clsx';
import Select, { type SelectProps } from '../Select';

export interface MenuSelectProps extends SelectProps {
  open?: boolean;
}

/**
 * 对齐原版MenuSelectWidget（DropdownWidget的菜单面板；原版中亦被LookupElement/ComboBoxInputWidget等复用）。
 * 键盘导航开关对齐原版static：handleNavigationKeys=true、listWrapsAround=false
 */
const MenuSelect = forwardRef<HTMLDivElement, MenuSelectProps>(({
  className,
  open = false,
  handleNavigationKeys = true,
  listWrapsAround = false,
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
      handleNavigationKeys={handleNavigationKeys}
      listWrapsAround={listWrapsAround}
      className={classes}
      ref={ref}
    />
  );
});

MenuSelect.displayName = 'MenuSelect';

export default MenuSelect;
