import React from 'react';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';
import type { ElementProps } from '../../widgets/Element';

export type LayoutProps = ElementProps;

const Layout: FunctionComponent<LayoutProps> = ({
  className,
  children,
  ...rest
}) => {
  const classes = classNames(
    className,
    'oo-ui-layout',
  );
  return (
    <div
      {...rest}
      className={classes}
    >
      {children}
    </div>
  );
};

export default Layout;
