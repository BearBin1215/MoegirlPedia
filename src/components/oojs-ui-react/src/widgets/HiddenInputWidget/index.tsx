import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { getWidgetClassName } from '../../utils';
import type { ElementProps } from '../../Element';

export interface HiddenInputWidgetProps extends ElementProps<HTMLInputElement> {

  /** 隐藏输入的值（对齐原版config.value，缺省空串） */
  value?: string;

  /** 提交时的字段名（对齐原版config.name） */
  name?: string;

  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 隐藏输入组件，对齐原版OO.ui.HiddenInputWidget：以`<input type="hidden">`为根元素，
 * 承载不展示但需随表单提交的值（如数组字段、与多值控件配对的值）。
 *
 * 与原版的两点差异（原版只切换`oo-ui-widget-*`类、显式移除`aria-disabled`）：
 * - `disabled`落到原生属性上——原版经Widget基类只切类，表单仍会提交被"禁用"的值；
 * - `value`为受控值，随props更新（原版构造期写入后仅能命令式改动）。
 */
export const HiddenInputWidget = forwardRef<HTMLInputElement, HiddenInputWidgetProps>(({
  className,
  disabled,
  value = '',
  ...rest
}, ref) => (
  <input
    {...rest}
    className={clsx(className, getWidgetClassName({ disabled }))}
    type='hidden'
    value={value}
    disabled={disabled}
    ref={ref}
  />
));

HiddenInputWidget.displayName = 'HiddenInputWidget';
