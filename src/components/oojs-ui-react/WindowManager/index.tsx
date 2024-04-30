import React from 'react';
import classNames from 'classnames';
import type { ElementProps } from '../Element';
import type { ReactNode, FunctionComponent } from 'react';

export interface WindowManagerProps extends ElementProps<HTMLDivElement> {

}

const WindowManager: FunctionComponent<WindowManagerProps> = ({
  className,
  children,
  ...rest
}) => {
  const classes = classNames(
    className,
    'oo-ui-windowManager',
    'oo-ui-windowManager-modal',
  );

  return (
    <div
      className={classes}
      {...rest}
    >
      {children}
    </div>
  );
};

export default WindowManager;
