import React from 'react';
import classNames from 'classnames';
import type { HTMLAttributes, FunctionComponent } from 'react';
import type { IndicatorElement } from '../mixin';

export interface IndicatorBaseProps extends
  Omit<HTMLAttributes<HTMLSpanElement>, 'className'>,
  IndicatorElement {
  className?: string;
}

const IndicatorBase: FunctionComponent<IndicatorBaseProps> = ({
  className,
  indicator,
  ...rest
}) => {
  const IndicatorClassName = classNames(
    'oo-ui-indicatorElement-indicator',
    indicator && `oo-ui-indicator-${indicator}`,
    className,
  );

  return <span {...rest} className={IndicatorClassName} />;
};

export default IndicatorBase;
