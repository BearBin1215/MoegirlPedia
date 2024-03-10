/**
 * @description 仅有最简单功能的FieldLayout
 */

import React from 'react';
import classNames from 'classnames';
import type { ReactNode, FunctionComponent } from 'react';
import type { WidgetProps } from '../props';
import type { LabelElement } from '../mixin';

export interface FieldLayoutProps extends
  WidgetProps<HTMLDivElement>,
  LabelElement {

  /** 标签对其方向 */
  align?: 'left' | 'right' | 'top' | 'inline';

  help?: ReactNode;
}

const FieldLayout: FunctionComponent<FieldLayoutProps> = ({
  align = 'left',
  children,
  classes,
  label,
  ...rest
}) => {
  const layoutClassName = classNames(
    classes,
    'oo-ui-layout',
    label && 'oo-ui-labelElement',
    'oo-ui-fieldLayout',
    `oo-ui-fieldLayout-align-${align}`,
  );

  const layoutHeader = (
    <span className='oo-ui-fieldLayout-header'>
      <label className='oo-ui-labelElement-label'>{label}</label>
    </span>
  );

  const layoutField = (
    <span className='oo-ui-fieldLayout-field'>
      {children}
    </span>
  );

  return (
    <div
      className={layoutClassName}
      {...rest}
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
    </div>
  );
};

export default FieldLayout;
