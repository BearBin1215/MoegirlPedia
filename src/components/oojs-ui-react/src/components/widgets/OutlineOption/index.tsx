import React, { forwardRef } from 'react';
import clsx from 'clsx';
import DecoratedOption, { type DecoratedOptionProps } from '../DecoratedOption';
import type { OptionData } from '../Option';

export interface OutlineOptionProps extends DecoratedOptionProps, OptionData {
  level?: number;
}

const OutlineOption = forwardRef<HTMLDivElement, OutlineOptionProps>(({
  className,
  level = 0,
  selected,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    'oo-ui-outlineOptionWidget',
    `oo-ui-outlineOptionWidget-level-${level}`,
    selected && 'oo-ui-optionWidget-selected',
  );

  return (
    <DecoratedOption
      {...rest}
      className={classes}
      ref={ref}
    />
  );
});

OutlineOption.displayName = 'OutlineOption';

export default OutlineOption;
