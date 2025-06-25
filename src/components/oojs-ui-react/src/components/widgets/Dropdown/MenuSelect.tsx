import React, { forwardRef } from 'react';
import clsx from 'clsx';
import Select from '../Select';
import type { SelectProps } from '../Select';

export interface MenuSelectProps extends SelectProps {
  open?: boolean;
}

/**
 * Dropdown组件内包裹的中间组件
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
