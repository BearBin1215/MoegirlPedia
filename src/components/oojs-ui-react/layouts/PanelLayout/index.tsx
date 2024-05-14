import React, { forwardRef } from 'react';
import classNames from 'classnames';
import Layout from '../Layout';
import type { LayoutProps } from '../Layout';
import type { ElementRef } from '../../types/ref';

export interface PanelLayoutProps extends LayoutProps {
  scrollable?: boolean;
  padded?: boolean;
  expanded?: boolean;
  framed?: boolean;
}

const PanelLayout = forwardRef<ElementRef<HTMLDivElement>, PanelLayoutProps>(({
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
