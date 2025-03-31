import React, { forwardRef } from 'react';
import classNames from 'classnames';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { processClassNames } from '../../../utils/tool';
import type { WidgetProps } from '../Widget';
import type { IconElement, IndicatorElement } from '../../../types/mixin';

export interface DecoratedOptionProps extends
  WidgetProps<HTMLDivElement>,
  IconElement,
  IndicatorElement {}

const DecoratedOption = forwardRef<HTMLDivElement, DecoratedOptionProps>(({
  children,
  className,
  disabled,
  icon,
  indicator,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    processClassNames({
      disabled,
      label: children,
      icon,
      indicator,
    }, 'option', 'decoratedOption'),
  );

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      tabIndex={-1}
      role='option'
      ref={ref}
    >
      <IconBase icon={icon} />
      <LabelBase>{children}</LabelBase>
      <IndicatorBase indicator={indicator} />
    </div>
  );
});

DecoratedOption.displayName = 'DecoratedOption';

export default DecoratedOption;
