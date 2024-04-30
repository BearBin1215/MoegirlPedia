import React from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import type { ElementProps } from '../Element';
import type { FunctionComponent } from 'react';

export type WindowManagerProps = ElementProps<HTMLDivElement>;

const WindowManager: FunctionComponent<WindowManagerProps> = ({
  className,
  children,
  ...rest
}) => {
  const classes = classNames(
    className,
    'oo-ui-windowManager',
    'oo-ui-windowManager-modal',
    'oo-ui-windowManager-floating',
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
