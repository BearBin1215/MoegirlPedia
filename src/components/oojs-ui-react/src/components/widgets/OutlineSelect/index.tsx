import React, { forwardRef, type ReactElement } from 'react';
import classNames from 'classnames';
import Select, { type SelectProps } from '../Select';
import type { OutlineOptionProps } from '../OutlineOption';
import type { ElementRef } from '../../../types/ref';

export type OutlineSelectProps = SelectProps;

export interface OptionElement extends ReactElement<OutlineOptionProps> {
  children?: OptionElement | OptionElement[];
}

const OutlineSelect = forwardRef<ElementRef<HTMLDivElement>, OutlineSelectProps>(({
  className,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    'oo-ui-outlineSelectWidget',
  );

  return (
    <Select
      ref={ref}
      className={classes}
      outline
      {...rest}
    />
  );
});

OutlineSelect.displayName = 'OutlineSelect';

export default OutlineSelect;
