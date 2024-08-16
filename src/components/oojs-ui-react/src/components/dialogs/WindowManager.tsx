import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import type { ElementProps } from '../../types/mixin';
import type { ElementRef } from '../../types/ref';

export interface WindowManagerProps extends ElementProps<HTMLDivElement> {
  full?: boolean;
  modal?: boolean;
  'aria-hidden'?: boolean | 'true' | 'false';
  /** 要渲染的节点 */
  portal?: Element | DocumentFragment,
}

const WindowManager = forwardRef<ElementRef<HTMLDivElement>, WindowManagerProps>(({
  className,
  children,
  modal = true,
  full,
  portal = document.body,
  ...rest
}, ref) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const classes = classNames(
    className,
    'oo-ui-windowManager',
    modal && 'oo-ui-windowManager-modal',
    full ? 'oo-ui-windowManager-fullscreen' : 'oo-ui-windowManager-floating',
  );

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }));

  return createPortal(
    <div {...rest} className={classes} ref={elementRef}>{children}</div>,
    portal,
  );
});

WindowManager.displayName = 'WindowManager';

export default WindowManager;
