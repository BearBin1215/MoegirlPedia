/**
 * @description 仅有最简单功能的FieldLayout
 */

import React, { forwardRef } from 'react';
import classNames from 'classnames';
import LabelBase from '../../widgets/Label/Base';
import Layout from '../Layout';
import type { ReactNode } from 'react';
import type { WidgetProps } from '../../types/props';
import type { LabelElement } from '../../types/mixin';
import type { ElementRef } from '../../types/ref';

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

  const layoutHeader = (
    <span className='oo-ui-fieldLayout-header'>
      <LabelBase>{label}</LabelBase>
    </span>
  );

  const layoutField = (
    <span className='oo-ui-fieldLayout-field'>
      {children}
    </span>
  );

  return (
    <Layout
      {...rest}
      className={classes}
      ref={ref}
    >
      <div className='oo-ui-fieldLayout-body'>
        {align === 'inline' ? [
          layoutField,
          layoutHeader,
        ] : [
          layoutHeader,
          layoutField,
        ]}
      </div>
    </Layout>
  );
});

FieldLayout.displayName = 'FieldLayout';

export default FieldLayout;
