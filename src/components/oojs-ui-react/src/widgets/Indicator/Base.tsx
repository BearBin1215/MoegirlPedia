import React, { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

/** 主题支持的指示器集合 */
export type Indicators = 'clear' | 'up' | 'down' | 'required';

/** 指示器元素参数 */
export interface IndicatorElement {
  /** 组件指示器 */
  indicator?: Indicators;
}

export type IndicatorBaseProps =
  HTMLAttributes<HTMLSpanElement> &
  IndicatorElement;

/** 指示器基础元素（无Widget包装），输出指示器类与noIndicator占位类，供各组件内嵌复用 */
const IndicatorBase = forwardRef<HTMLSpanElement, IndicatorBaseProps>(({
  className,
  indicator,
  ...rest
}, ref) => {
  // noIndicator占位类对齐原版IndicatorElement.setIndicator：无指示器时输出（主题CSS以其隐藏空占位）
  const classes = clsx(
    'oo-ui-indicatorElement-indicator',
    !indicator && 'oo-ui-indicatorElement-noIndicator',
    indicator && `oo-ui-indicator-${indicator}`,
    className,
  );

  return <span {...rest} className={classes} ref={ref} />;
});

IndicatorBase.displayName = 'IndicatorBase';

export default IndicatorBase;
