import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { getWidgetClassName, resolveTitle } from '../../mixins';
import type { WidgetProps } from '../Widget';
import { LabelBase } from './Base';

/** 标签相对控件的位置（输入类组件经labelPosition使用） */
export type LabelPosition = 'before' | 'after';

export type LabelProps = WidgetProps<HTMLSpanElement> & {
  /**
   * 标签视觉隐藏（对齐原版LabelElement的invisibleLabel）：根元素不再输出`oo-ui-labelElement`
   * （原版setInvisibleLabel的"视同无标签"语义），裁剪类落在label元素上
   */
  invisibleLabel?: boolean;
};

/** 独立标签组件，对齐原版OO.ui.LabelWidget：基于LabelBase附加Widget类名 */
export const Label = forwardRef<HTMLSpanElement, LabelProps>(({
  className,
  children,
  disabled,
  invisibleLabel,
  title,
  ...rest
}, ref) => {
  // oo-ui-labelElement由labelElementClasses按"有标签才输出"派生（对齐原版setLabel），
  // 不额外补写——LabelWidget的label元素即根元素，该根类与LabelBase的-label类并存
  const classes = clsx(
    className,
    getWidgetClassName({ disabled, label: children, invisibleLabel }, 'label'),
  );

  return (
    <LabelBase
      {...rest}
      className={classes}
      // title解析走resolveTitle（原版LabelWidget混入TitledElement，$titled即根元素）
      title={resolveTitle({ title, label: children, invisibleLabel })}
      invisible={invisibleLabel}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      {children}
    </LabelBase>
  );
});

Label.displayName = 'Label';
