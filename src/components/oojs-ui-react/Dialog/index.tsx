import React from 'react';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';

export interface DialogProps {
  size?: 'small' | 'medium' | 'large';
  open?: boolean;
}

const Dialog: FunctionComponent<DialogProps> = ({
  size,
  open,
}) => {
  const classes = classNames(
    'oo-ui-window',
    'oo-ui-dialog',
    open ? 'oo-ui-window-active oo-ui-window-setup oo-ui-window-ready' : 'oo-ui-element-hidden',
  );

  return (
    <div
      className={classes}
    >
      <div
        className='oo-ui-window-frame'
        style={{ transition: 'all 0.25s ease 0s', width: '700px', height: '119px' }}
      >
        <div tabIndex={0} />
        <div tabIndex={0} />
      </div>
      <div className='oo-ui-window-overlay' />
    </div>
  );
};

export default Dialog;
