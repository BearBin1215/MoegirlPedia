import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import type { ElementProps } from '../../widgets/Element';
import type { ElementRef } from '../../types/ref';

export type LayoutProps = ElementProps;

const Layout = forwardRef<ElementRef, LayoutProps>(({
  className,
  children,
  ...rest
}, ref) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const classes = classNames(
    className,
    'oo-ui-layout',
  );

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }));

  return (
    <div
      {...rest}
      className={classes}
      ref={elementRef}
    >
      {children}
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
