import React, { forwardRef } from 'react';
import classNames from 'classnames';
import PanelLayout from '../PanelLayout';
import type { PanelLayoutProps } from '../PanelLayout';
import type { ElementRef } from '../../types/ref';

export interface PageLayoutProps extends PanelLayoutProps {
  active?: boolean;
  label?: string;
}

const PageLayout = forwardRef<ElementRef<HTMLDivElement>, PageLayoutProps>(({
  active,
  className,
  children,
  expanded = true,
  scrollable = true,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    'oo-ui-pageLayout',
    active ? 'oo-ui-pageLayout-active' : 'oo-ui-element-hidden',
  );

  return (
    <PanelLayout
      {...rest}
      expanded={expanded}
      scrollable={scrollable}
      className={classes}
      aria-hidden={!active}
      ref={ref}
    >
      {children}
    </PanelLayout>
  );
});

PageLayout.displayName = 'PageLayout';

export default PageLayout;
