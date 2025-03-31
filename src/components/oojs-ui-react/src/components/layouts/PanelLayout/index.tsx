import React, { forwardRef } from 'react';
import classNames from 'classnames';
import Layout, { type LayoutProps } from '../Layout';

export interface PanelLayoutProps extends LayoutProps {
  /** 是否可滚动 */
  scrollable?: boolean;
  /** 是否留出内边距 */
  padded?: boolean;
  /** 是否铺满父元素 */
  expanded?: boolean;
  /** 有误边框 */
  framed?: boolean;
}

/** @description 面板组件，用于制作各类布局组件 */
const PanelLayout = forwardRef<HTMLDivElement, PanelLayoutProps>(({
  className,
  children,
  scrollable,
  padded,
  expanded = true,
  framed,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    'oo-ui-panelLayout',
    scrollable && 'oo-ui-panelLayout-scrollable',
    padded && 'oo-ui-panelLayout-padded',
    expanded && 'oo-ui-panelLayout-expanded',
    framed && 'oo-ui-panelLayout-framed',
  );

  return (
    <Layout
      {...rest}
      className={classes}
      ref={ref}
    >
      {children}
    </Layout>
  );
});

PanelLayout.displayName = 'PanelLayout';

export default PanelLayout;
