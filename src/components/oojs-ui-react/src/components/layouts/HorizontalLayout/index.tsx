import React, { forwardRef } from 'react';
import classNames from 'classnames';
import Layout, { type LayoutProps } from '../Layout';

export type HorizontalLayoutProps = LayoutProps;

const HorizontalLayout = forwardRef<HTMLDivElement, HorizontalLayoutProps>(({
  className,
  children,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    'oo-ui-horizontalLayout',
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

HorizontalLayout.displayName = 'HorizontalLayout';

export default HorizontalLayout;
