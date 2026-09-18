import React, { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import { getWidgetClassName } from '../../mixins';
import type { WidgetProps } from '../Widget';
import type { IconElement, IndicatorElement } from '../../Element';
import { ButtonSlots } from '../Button/slots';

export type DecoratedOptionProps =
  WidgetProps<HTMLDivElement> &
  IconElement &
  IndicatorElement & {
    /** 选项集复用时随对象透入的标签/值，仅供组件吞掉以避免落成DOM属性（渲染用children） */
    label?: ReactNode;
    value?: string | number;

    /**
     * 图标/指示器的变体类（`oo-ui-image-*`）。判定由各选项形态承担
     * （选中/按压态着色见`getOptionIconClasses`），本组件只负责透传给ButtonSlots
     */
    variantClasses?: string;
  };

export const DecoratedOption = forwardRef<HTMLDivElement, DecoratedOptionProps>(({
  children,
  className,
  disabled,
  icon,
  indicator,
  variantClasses,
  label: _label,
  value: _value,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    getWidgetClassName({
      disabled,
      label: children,
      icon,
      indicator,
    }, 'option', 'decoratedOption'),
  );

  return (
    <div
      className={classes}
      aria-disabled={disabled || undefined}
      tabIndex={-1}
      role='option'
      {...rest}
      ref={ref}
    >
      <ButtonSlots
        icon={icon}
        variantClasses={variantClasses}
        label={children}
        indicator={indicator}
      />
    </div>
  );
});

DecoratedOption.displayName = 'DecoratedOption';

