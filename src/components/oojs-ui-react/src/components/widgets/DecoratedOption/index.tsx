import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { generateWidgetClassName } from '../../../utils/tool';
import type { WidgetProps } from '../Widget';
import type { IconElement, IndicatorElement } from '../../../types/mixin';

export type DecoratedOptionProps =
  WidgetProps<HTMLDivElement> &
  IconElement &
  IndicatorElement;

const DecoratedOption = forwardRef<HTMLDivElement, DecoratedOptionProps>(({
  children,
  className,
  disabled,
  icon,
  indicator,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    generateWidgetClassName({
      disabled,
      label: children,
      icon,
      indicator,
    }, 'option', 'decoratedOption'),
  );

  return (
    <div
      {...omit(rest, 'label', 'data')}
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
