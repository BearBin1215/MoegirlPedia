import React, { forwardRef } from 'react';
import classNames from 'classnames';
import Select from '../Select';
import type { ReactElement } from 'react';
import type { ElementRef } from '../../../types/ref';
import type { SelectProps } from '../Select';
import type { OutlineOptionProps } from '../OutlineOption';

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
      {...rest}
    />
  );
});

OutlineSelect.displayName = 'OutlineSelect';

export default OutlineSelect;
