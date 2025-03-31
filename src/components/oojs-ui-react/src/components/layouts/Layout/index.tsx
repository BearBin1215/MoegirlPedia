import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { ElementProps } from '../../../types/mixin';

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
  const classes = classNames(
    className,
    'oo-ui-layout',
    hidden && 'oo-ui-element-hidden',
  );

  return (
    <div
      {...rest}
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
