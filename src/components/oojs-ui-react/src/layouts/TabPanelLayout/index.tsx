import React, { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import PanelLayout, { type PanelLayoutProps } from '../PanelLayout';

export interface TabPanelLayoutProps extends PanelLayoutProps {
  /** 是否为当前激活面板 */
  active?: boolean;

  /** 页签集复用时随对象透入的标签/值/禁用态，仅供组件吞掉以避免落成DOM属性 */
  label?: ReactNode;
  value?: string | number;
  disabled?: boolean;
}

/** @description 页签面板组件，用于`IndexLayout`组件的分页 */
const TabPanelLayout = forwardRef<HTMLDivElement, TabPanelLayoutProps>(({
  className,
  children,
  active,
  expanded = true,
  scrollable = true,
  label: _label,
  value: _value,
  disabled: _disabled,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    'oo-ui-tabPanelLayout',
    active && 'oo-ui-tabPanelLayout-active',
  );

  return (
    <PanelLayout
      {...rest}
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
