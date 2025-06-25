import React, { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';
import type { IndicatorElement } from '../../../types/mixin';

export interface IndicatorBaseProps extends
  HTMLAttributes<HTMLSpanElement>,
  IndicatorElement { }

const IndicatorBase = forwardRef<HTMLSpanElement, IndicatorBaseProps>(({
  className,
  indicator,
  ...rest
}, ref) => {
  const classes = clsx(
    'oo-ui-indicatorElement-indicator',
    indicator && `oo-ui-indicator-${indicator}`,
    className,
  );

  return <span {...rest} className={classes} ref={ref} />;
});

IndicatorBase.displayName = 'IndicatorBase';

export default IndicatorBase;
