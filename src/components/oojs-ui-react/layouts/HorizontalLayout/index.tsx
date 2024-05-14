import React, { forwardRef } from 'react';
import classNames from 'classnames';
import Layout from '../Layout';
import type { LayoutProps } from '../Layout';
import type { ElementRef } from '../../types/ref';

export type HorizontalLayoutProps = LayoutProps;

const HorizontalLayout = forwardRef<ElementRef<HTMLDivElement>, HorizontalLayoutProps>(({
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
