import React from 'react';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../props';
import type { Indicator } from '../utils';

export interface IndicatorWidgetProps extends Omit<WidgetProps<HTMLSpanElement>, 'children'> {
  /** 图标 */
  indicator?: Indicator;
}

const IndicatorWidget: FunctionComponent<IndicatorWidgetProps> = ({
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
      className={className}
      aria-disabled
      {...rest}
    />
  );
};

export default IndicatorWidget;
