import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import IndicatorBase from './Base';
import { processClassNames } from '../../../utils/tool';
import type { WidgetProps } from '../../../types/props';
import type { IndicatorElement } from '../../../types/mixin';
import type { ElementRef } from '../../../types/ref';

export interface IndicatorProps extends
  Omit<WidgetProps<HTMLSpanElement>, 'children'>,
  IndicatorElement { }

const Indicator = forwardRef<ElementRef<HTMLSpanElement>, IndicatorProps>(({
  indicator,
  className,
  disabled,
  ...rest
}, ref) => {
  const elementRef = useRef<HTMLSpanElement>(null);

  const classes = classNames(
    className,
    processClassNames({ disabled, indicator }, 'indicator'),
  );

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }));

  return (
    <IndicatorBase
      {...rest}
      className={classes}
      indicator={indicator}
      aria-disabled={!!disabled}
      ref={elementRef}
    />
  );
});

Indicator.displayName = 'Indicator';

export default Indicator;
