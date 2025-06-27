import React, { forwardRef } from 'react';
import clsx from 'clsx';
import IndicatorBase from './Base';
import { processClassNames } from '../../../utils/tool';
import type { WidgetProps } from '../Widget';
import type { IndicatorElement } from '../../../types/mixin';

export type IndicatorProps =
  Omit<WidgetProps<HTMLSpanElement>, 'children'> &
  IndicatorElement;

const Indicator = forwardRef<HTMLSpanElement, IndicatorProps>(({
  indicator,
  className,
  disabled,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    processClassNames({ disabled, indicator }, 'indicator'),
  );

  return (
    <IndicatorBase
      {...rest}
      className={classes}
      indicator={indicator}
      aria-disabled={!!disabled}
      ref={ref}
    />
  );
});

Indicator.displayName = 'Indicator';

export default Indicator;
