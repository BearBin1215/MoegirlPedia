import React from 'react';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../props';
import type { IndicatorElement } from '../mixin';

export interface IndicatorProps extends
  Omit<WidgetProps<HTMLSpanElement>, 'children'>,
  IndicatorElement { }

const Indicator: FunctionComponent<IndicatorProps> = ({
  indicator,
  classes,
  disabled,
  ...rest
}) => {
  const className = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-indicatorElement',
    'oo-ui-indicatorElement-indicator',
    indicator && `oo-ui-indicator-${indicator}`,
    'oo-ui-indicatorWidget',
  );

  return (
    <span
      {...rest}
      className={className}
      aria-disabled
    />
  );
};

export default Indicator;
