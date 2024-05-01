import React from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';
import type { ElementProps } from '../Element';

export interface WindowManagerProps extends ElementProps<HTMLDivElement> {
  full?: boolean;
  'aria-hidden'?: boolean | 'true' | 'false';
}

const WindowManager: FunctionComponent<WindowManagerProps> = ({
  className,
  children,
  full,
  ...rest
}) => {
  const classes = classNames(
    className,
    'oo-ui-windowManager',
    'oo-ui-windowManager-modal',
    'oo-ui-windowManager-floating',
    full && 'oo-ui-windowManager-fullscreen',
  );

  return (
    <>
      {createPortal(
        <div
          className={classes}
          {...rest}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
};

export default WindowManager;
