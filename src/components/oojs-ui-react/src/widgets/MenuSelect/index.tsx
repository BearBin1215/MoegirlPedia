import React, { forwardRef } from 'react';
import clsx from 'clsx';
import Select from '../Select';
import type { SelectProps } from '../Select';

export interface MenuSelectProps extends SelectProps {
  open?: boolean;
}

/**
 * 对齐原版MenuSelectWidget（DropdownWidget的菜单面板；原版中亦被LookupElement/ComboBoxInputWidget等复用）
 */
const MenuSelect = forwardRef<HTMLDivElement, MenuSelectProps>(({
  className,
  open = false,
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
      ref={ref}
    />
  );
});

MenuSelect.displayName = 'MenuSelect';

export default MenuSelect;
