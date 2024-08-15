import React, { forwardRef } from 'react';
import classNames from 'classnames';
import DecoratedOption, { type DecoratedOptionProps } from '../DecoratedOption';
import type { OptionData } from '../Option';
import type { ElementRef } from '../../../types/ref';

export interface OutlineOptionProps extends DecoratedOptionProps, OptionData {
  level?: number;
}

const OutlineOption = forwardRef<ElementRef<HTMLDivElement>, OutlineOptionProps>(({
  className,
  level = 0,
  selected,
  ...rest
}, ref) => {
  const classes = classNames(
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
