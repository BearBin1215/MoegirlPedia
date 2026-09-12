import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { LabelBase } from '../../widgets/Label/Base';
import { hasLabel } from '../../utils';
import { Layout } from '../Layout';
import type { WidgetProps } from '../../widgets/Widget';
import type { LabelElement } from '../../widgets/Label';

export interface FieldLayoutProps extends
  WidgetProps<HTMLDivElement>,
  LabelElement {

  /** 标签对齐方向 */
  align?: 'left' | 'right' | 'top' | 'inline';
}

export const FieldLayout = forwardRef<HTMLDivElement, FieldLayoutProps>(({
  align = 'left',
  children,
  className,
  disabled,
  invisibleLabel,
  label,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    hasLabel(label) && 'oo-ui-labelElement',
    'oo-ui-fieldLayout',
    `oo-ui-fieldLayout-align-${align}`,
    // disabled须从rest剥离，否则泄漏为div的非法DOM属性
    disabled && 'oo-ui-fieldLayout-disabled',
  );

  const child = [
    <span className='oo-ui-fieldLayout-field' key='field'>
      {children}
    </span>,
    <span className='oo-ui-fieldLayout-header' key='header'>
      {/* invisibleLabel的裁剪类落在label元素上 */}
      <LabelBase className={clsx(invisibleLabel && 'oo-ui-labelElement-invisible')}>{label}</LabelBase>
    </span>,
  ];

  return (
    <Layout
      {...rest}
      className={classes}
      ref={ref}
    >
      <div className='oo-ui-fieldLayout-body'>
        {align === 'inline' ? child : [...child].reverse()}
      </div>
    </Layout>
  );
});

FieldLayout.displayName = 'FieldLayout';

