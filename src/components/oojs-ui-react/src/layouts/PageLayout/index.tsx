import React, { forwardRef } from 'react';
import clsx from 'clsx';
import PanelLayout, { type PanelLayoutProps } from '../PanelLayout';
import { omit } from 'lodash-es';

export type PageLayoutProps = PanelLayoutProps;

/** @description 页组件，用于`BookletLayout`组件的子元素生成分页，`key`参数必须 */
const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(({
  className,
  children,
  hidden,
  expanded = true,
  scrollable = true,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    'oo-ui-pageLayout',
    !hidden && 'oo-ui-pageLayout-active',
  );

  return (
    <PanelLayout
      {...omit(rest, 'label')}
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
