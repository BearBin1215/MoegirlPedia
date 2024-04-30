import React from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { processArray } from '../utils/tool';
import type { FunctionComponent } from 'react';
import type { ElementProps } from '../Element';

export interface WindowManagerProps extends ElementProps<HTMLDivElement> {
  full?: boolean;
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

  const hasOpen = processArray(children).some((child) => {
    return child && typeof child === 'object' && 'props' in child && child?.props.open;
  });

  return (
    <>
      {createPortal(
        <div
          className={classes}
          {...rest}
          aria-hidden={hasOpen ? void 0 : true}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
};

export default WindowManager;
