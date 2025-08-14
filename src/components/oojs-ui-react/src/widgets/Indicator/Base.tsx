import React, { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type Indicators = 'clear' | 'up' | 'down' | 'required';

/** 指示器元素参数 */
export interface IndicatorElement {
  /** 组件指示器 */
  indicator?: Indicators;
}

export type IndicatorBaseProps =
  HTMLAttributes<HTMLSpanElement> &
  IndicatorElement;

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
