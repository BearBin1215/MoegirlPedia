import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { generateWidgetClassName } from 'oojs-ui-react/utils/tool';
import type { WidgetProps } from '../Widget';
import type { IndicatorElement } from '../../../types/mixin';
import IndicatorBase from './Base';

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
    generateWidgetClassName({ disabled, indicator }, 'indicator'),
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
