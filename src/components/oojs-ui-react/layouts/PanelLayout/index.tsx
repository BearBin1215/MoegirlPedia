import React from 'react';
import classNames from 'classnames';
import Layout from '../Layout';
import type { FunctionComponent } from 'react';
import type { LayoutProps } from '../Layout';

export interface PanelLayoutProps extends LayoutProps {
  scrollable?: boolean;
  padded?: boolean;
  expanded?: boolean;
  framed?: boolean;
}

const PanelLayout: FunctionComponent<PanelLayoutProps> = ({
  className,
  children,
  scrollable,
  padded,
  expanded = true,
  framed,
  ...rest
}) => {
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
    >
      {children}
    </Layout>
  );
};

export default PanelLayout;
