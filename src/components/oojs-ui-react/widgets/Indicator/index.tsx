import React from 'react';
import classNames from 'classnames';
import IndicatorBase from './Base';
import { processClassNames } from '../../utils/tool';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../../types/props';
import type { IndicatorElement } from '../../types/mixin';

export interface IndicatorProps extends
  Omit<WidgetProps<HTMLSpanElement>, 'children'>,
  IndicatorElement { }

const Indicator: FunctionComponent<IndicatorProps> = ({
  indicator,
  className,
  disabled,
  ...rest
}) => {
  const classes = classNames(
    className,
    processClassNames({ disabled, indicator }, 'indicator'),
  );

  return (
    <IndicatorBase
      {...rest}
      className={classes}
      indicator={indicator}
      aria-disabled={!!disabled}
    />
  );
};

export default Indicator;
