import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import type { ElementProps } from '../../types/mixin';

export interface WindowManagerProps extends ElementProps<HTMLDivElement> {
  full?: boolean;
  modal?: boolean;
  'aria-hidden'?: boolean | 'true' | 'false';
  /** 要渲染的节点 */
  portal?: Element | DocumentFragment,
}

const WindowManager = forwardRef<HTMLDivElement, WindowManagerProps>(({
  className,
  children,
  modal = true,
  full,
  portal = document.body,
  ...rest
}, ref) => {

  const classes = clsx(
    className,
    'oo-ui-windowManager',
    modal && 'oo-ui-windowManager-modal',
    full ? 'oo-ui-windowManager-fullscreen' : 'oo-ui-windowManager-floating',
  );

  return createPortal(
    <div
      {...rest}
      className={classes}
      ref={ref}
    >
      {children}
    </div>,
    portal,
  );
});

WindowManager.displayName = 'WindowManager';

export default WindowManager;
