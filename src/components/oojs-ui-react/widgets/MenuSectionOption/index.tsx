import React, { forwardRef } from 'react';
import classNames from 'classnames';
import DecoratedOption from '../DecoratedOption';
import type { DecoratedOptionProps } from '../DecoratedOption';
import type { ElementRef } from '../../types/ref';

export type MenuSectionOptionProps = DecoratedOptionProps;

const MenuSectionOption = forwardRef<ElementRef<HTMLDivElement>, MenuSectionOptionProps>(({
  className,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    'oo-ui-menuSectionOptionWidget',
  );

  return (
    <DecoratedOption
      {...rest}
      className={classes}
      ref={ref}
    />
  );
});

MenuSectionOption.displayName = 'MenuSectionOption';

export default MenuSectionOption;
