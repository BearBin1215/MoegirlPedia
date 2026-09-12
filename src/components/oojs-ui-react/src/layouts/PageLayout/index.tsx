import React, { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import { omit } from 'es-toolkit';
import { PanelLayout, type PanelLayoutProps } from '../PanelLayout';

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

/** 页组件，由`StackLayout`按`options`生成分页，`value`兼作激活匹配与列表key */
export const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(({
  className,
  children,
  hidden,
  active,
  expanded = true,
  scrollable = true,
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
      {...omit(rest, ['label', 'value'])}
      expanded={expanded}
      scrollable={scrollable}
      className={classes}
      hidden={hidden}
      ref={ref}
    >
      {children}
    </PanelLayout>
  );
});

PageLayout.displayName = 'PageLayout';

