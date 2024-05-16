import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import type { ElementProps } from '../../widgets/Element';
import type { ElementRef } from '../../types/ref';

export interface LayoutProps extends ElementProps {
  hidden?: boolean;
}

const Layout = forwardRef<ElementRef, LayoutProps>(({
  className,
  children,
  hidden,
  ...rest
}, ref) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const classes = classNames(
    className,
    'oo-ui-layout',
    hidden && 'oo-ui-element-hidden',
  );

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }));

  return (
    <div
      {...rest}
      className={classes}
      aria-hidden={hidden}
      ref={elementRef}
    >
      {children}
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
