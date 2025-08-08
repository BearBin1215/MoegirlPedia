import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import type { ElementProps } from '../../mixins';

export interface LayoutProps extends ElementProps {
  /** 是否隐藏 */
  hidden?: boolean;
}

/** @description 布局组件基础 */
const Layout = forwardRef<HTMLDivElement, LayoutProps>(({
  className,
  children,
  hidden,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    'oo-ui-layout',
    hidden && 'oo-ui-element-hidden',
  );

  return (
    <div
      {...omit(rest, 'activeKey')}
      className={classes}
      aria-hidden={hidden}
      ref={ref}
    >
      {children}
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
