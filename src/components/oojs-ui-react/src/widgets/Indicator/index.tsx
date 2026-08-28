import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { generateWidgetClassName } from '../../utils';
import type { WidgetProps } from '../Widget';
import IndicatorBase, {
  type IndicatorElement,
  type Indicators,
} from './Base';

export type IndicatorProps =
  Omit<WidgetProps<HTMLSpanElement>, 'children'> &
  IndicatorElement & {
    /** 指示器title提示（等价原版IndicatorElement的indicatorTitle配置） */
    indicatorTitle?: string;
  };

const Indicator = forwardRef<HTMLSpanElement, IndicatorProps>(({
  indicator,
  className,
  disabled,
  indicatorTitle,
  title,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, indicator, invisibleLabel: true }, 'indicator'),
  );

  return (
    <IndicatorBase
      {...rest}
      className={classes}
      indicator={indicator}
      title={title ?? indicatorTitle}
      aria-disabled={disabled}
      ref={ref}
    />
  );
});

Indicator.displayName = 'Indicator';

export default Indicator;
export { IndicatorElement, Indicators };
