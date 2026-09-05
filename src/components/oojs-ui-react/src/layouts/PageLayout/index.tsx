import React, { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import PanelLayout, { type PanelLayoutProps } from '../PanelLayout';

export type PageLayoutProps = PanelLayoutProps & {
  /**
   * 是否为激活页。缺省时由`hidden`派生（非hidden即激活）；
   * continuous模式下所有页面均可见，需显式传入以区分激活态
   */
  active?: boolean;

  /** 页签集复用时随对象透入的标签/值，仅供组件吞掉以避免落成DOM属性 */
  label?: ReactNode;
  value?: string | number;
};

/** @description 页组件，用于`BookletLayout`组件的子元素生成分页，`key`参数必须 */
const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(({
  className,
  children,
  hidden,
  active,
  expanded = true,
  scrollable = true,
  label: _label,
  value: _value,
  ...rest
}, ref) => {
  const isActive = active ?? !hidden;
  const classes = clsx(
    className,
    'oo-ui-pageLayout',
    isActive && 'oo-ui-pageLayout-active',
  );

  return (
    <PanelLayout
      {...rest}
      expanded={expanded}
      scrollable={scrollable}
      className={classes}
      aria-hidden={!!hidden}
      hidden={hidden}
      ref={ref}
    >
      {children}
    </PanelLayout>
  );
});

PageLayout.displayName = 'PageLayout';

export default PageLayout;
