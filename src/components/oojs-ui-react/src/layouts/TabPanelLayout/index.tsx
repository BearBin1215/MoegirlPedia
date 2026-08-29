import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { omit } from 'es-toolkit/compat';
import PanelLayout, { type PanelLayoutProps } from '../PanelLayout';

export interface TabPanelLayoutProps extends PanelLayoutProps {
  /** 是否为当前激活面板 */
  active?: boolean;
}

/** @description 页签面板组件，用于`IndexLayout`组件的分页 */
const TabPanelLayout = forwardRef<HTMLDivElement, TabPanelLayoutProps>(({
  className,
  children,
  active,
  expanded = true,
  scrollable = true,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    'oo-ui-tabPanelLayout',
    active && 'oo-ui-tabPanelLayout-active',
  );

  return (
    <PanelLayout
      {...omit(rest, 'label', 'value', 'disabled')}
      expanded={expanded}
      scrollable={scrollable}
      className={classes}
      role='tabpanel'
      ref={ref}
    >
      {children}
    </PanelLayout>
  );
});

TabPanelLayout.displayName = 'TabPanelLayout';

export default TabPanelLayout;
