import React, { forwardRef } from 'react';
import classNames from 'classnames';
import PanelLayout from '../PanelLayout';
import type { ReactNode } from 'react';
import type { PanelLayoutProps } from '../PanelLayout';
import type { ElementRef } from '../../types/ref';

export interface PageLayoutProps extends PanelLayoutProps {
  /** 用于BookletLayout子组件时生成页签 */
  label?: ReactNode;
}

/** @description 页组件，用于`BookletLayout`组件的子元素生成分页，`key`参数必须 */
const PageLayout = forwardRef<ElementRef<HTMLDivElement>, PageLayoutProps>(({
  className,
  children,
  hidden,
  expanded = true,
  scrollable = true,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    'oo-ui-pageLayout',
    !hidden && 'oo-ui-pageLayout-active',
  );

  return (
    <PanelLayout
      {...rest}
      expanded={expanded}
      scrollable={scrollable}
      className={classes}
      aria-hidden={hidden}
      hidden={hidden}
      ref={ref}
    >
      {children}
    </PanelLayout>
  );
});

PageLayout.displayName = 'PageLayout';

export default PageLayout;
