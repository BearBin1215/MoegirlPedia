import React, { forwardRef, type ReactNode } from 'react';
import classNames from 'classnames';
import LabelBase from '../../widgets/Label/Base';
import Layout from '../Layout';
import type { WidgetProps } from '../../widgets/Widget';
import type { LabelElement } from '../../../types/mixin';
import type { ElementRef } from '../../../types/ref';

export interface FieldLayoutProps extends
  WidgetProps<HTMLDivElement>,
  LabelElement {

  /** 标签对其方向 */
  align?: 'left' | 'right' | 'top' | 'inline';

  help?: ReactNode;
}

const FieldLayout = forwardRef<ElementRef<HTMLDivElement>, FieldLayoutProps>(({
  align = 'left',
  children,
  className,
  label,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    label && 'oo-ui-labelElement',
    'oo-ui-fieldLayout',
    `oo-ui-fieldLayout-align-${align}`,
  );

  const child = [
    <span className='oo-ui-fieldLayout-field' key='field'>
      {children}
    </span>,
    <span className='oo-ui-fieldLayout-header' key='header'>
      <LabelBase>{label}</LabelBase>
    </span>,
  ];

  return (
    <Layout
      {...rest}
      className={classes}
      ref={ref}
    >
      <div className='oo-ui-fieldLayout-body'>
        {align === 'inline' ? child : child.reverse()}
      </div>
    </Layout>
  );
});

FieldLayout.displayName = 'FieldLayout';

export default FieldLayout;
