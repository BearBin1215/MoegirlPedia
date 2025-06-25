import React, { forwardRef } from 'react';
import clsx from 'clsx';
import Layout, { type LayoutProps } from '../Layout';

export type HorizontalLayoutProps = LayoutProps;

const HorizontalLayout = forwardRef<HTMLDivElement, HorizontalLayoutProps>(({
  className,
  children,
  ...rest
}, ref) => {
  const classes = clsx(
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
