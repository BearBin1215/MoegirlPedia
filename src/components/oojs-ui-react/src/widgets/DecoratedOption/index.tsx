import React, { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { generateWidgetClassName } from '../../utils';
import type { WidgetProps } from '../Widget';
import type { IconElement } from '../Icon';
import type { IndicatorElement } from '../Indicator';

export type DecoratedOptionProps =
  WidgetProps<HTMLDivElement> &
  IconElement &
  IndicatorElement & {
    /** 选项集复用时随对象透入的标签/值，仅供组件吞掉以避免落成DOM属性（渲染用children） */
    label?: ReactNode;
    value?: string | number;
  };

const DecoratedOption = forwardRef<HTMLDivElement, DecoratedOptionProps>(({
  children,
  className,
  disabled,
  icon,
  indicator,
  label: _label,
  value: _value,
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
      className={classes}
      aria-disabled={!!disabled}
      tabIndex={-1}
      role='option'
      {...rest}
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
