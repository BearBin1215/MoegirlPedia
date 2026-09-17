import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { getWidgetClassName } from '../../mixins';
import type { IndicatorElement } from '../../Element';
import type { WidgetProps } from '../Widget';
import { IndicatorBase } from './Base';

export type IndicatorProps =
  Omit<WidgetProps<HTMLSpanElement>, 'children'> &
  IndicatorElement;

/** 独立指示器组件，对齐原版OO.ui.IndicatorWidget：基于IndicatorBase附加Widget类名 */
export const Indicator = forwardRef<HTMLSpanElement, IndicatorProps>(({
  indicator,
  className,
  disabled,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    getWidgetClassName({ disabled, indicator }, 'indicator'),
    // 单元素组件：根元素即label元素（原版IndicatorWidget混入LabelElement时$label指向根），
    // invisibleLabel的裁剪类按原版落在label（根）上
    'oo-ui-labelElement-invisible',
  );

  return (
    <IndicatorBase
      {...rest}
      className={classes}
      indicator={indicator}
      aria-disabled={disabled || undefined}
      ref={ref}
    />
  );
});

Indicator.displayName = 'Indicator';
