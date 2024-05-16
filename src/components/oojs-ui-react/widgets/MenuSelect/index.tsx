import React, { forwardRef } from 'react';
import classNames from 'classnames';
import Select from '../Select';
import type { SelectProps } from '../../types/props';
import type { InputWidgetRef } from '../../types/ref';

export interface MenuSelectProps extends SelectProps {
  open?: boolean;
}

export type MenuSelectRef = InputWidgetRef<HTMLDivElement, string | number | boolean | undefined>;

const MenuSelect = forwardRef<MenuSelectRef, MenuSelectProps>(({
  className,
  open = false,
  ...rest
}, ref) => {
  const classes = classNames(
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
