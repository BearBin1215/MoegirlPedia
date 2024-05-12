import React from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';
import type { ElementProps } from '../widgets/Element';

export interface WindowManagerProps extends ElementProps<HTMLDivElement> {
  full?: boolean;
  modal?: boolean;
  'aria-hidden'?: boolean | 'true' | 'false';
  /** 要渲染的节点 */
  portal?: Element | DocumentFragment,
}

const WindowManager: FunctionComponent<WindowManagerProps> = ({
  className,
  children,
  modal = true,
  full,
  portal = document.body,
  ...rest
}) => {
  const classes = classNames(
    className,
    'oo-ui-windowManager',
    modal && 'oo-ui-windowManager-modal',
    full ? 'oo-ui-windowManager-fullscreen' : 'oo-ui-windowManager-floating',
  );

  return createPortal(
    <div className={classes} {...rest}>{children}</div>,
    portal,
  );
};

export default WindowManager;
