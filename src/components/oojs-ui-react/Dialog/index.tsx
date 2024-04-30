import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { ElementProps } from '../Element';
import type { ReactNode, FunctionComponent } from 'react';

export interface DialogProps extends ElementProps<HTMLDivElement> {
  /** 弹窗大小 */
  size?: 'small' | 'medium' | 'large' | 'larger' | 'full';
  /** 弹窗是否为打开状态 */
  open?: boolean;
  /** 弹窗头部 */
  head?: ReactNode,
  /** 弹窗尾部 */
  foot?: ReactNode,
}

const Dialog: FunctionComponent<DialogProps> = ({
  className,
  size = 'small',
  open,
  head,
  children,
  foot,
  ...rest
}) => {
  const classes = classNames(
    className,
    'oo-ui-window',
    'oo-ui-dialog',
    open ? [
      'oo-ui-window-active',
      'oo-ui-window-setup',
      'oo-ui-window-ready',
    ] : 'oo-ui-element-hidden',
  );

  const contentClasses = classNames(
    'oo-ui-window-content',
    'oo-ui-dialog-content',
    'oo-ui-messageDialog-content',
    open && ['oo-ui-window-content-setup', 'oo-ui-window-content-ready'],
  );

  const frameWidth = useMemo(() => {
    switch (size) {
      case 'large':
        return '700px';
      case 'larger':
        return '900px';
      case 'full':
        return '100%';
      case 'small':
        return '300px';
      case 'medium':
      default:
        return '500px';
    }
  }, [size]);

  return (
    <div
      {...rest}
      className={classes}
    >
      <div
        className='oo-ui-window-frame'
        style={{ transition: 'all 0.25s ease 0s', width: frameWidth }}
      >
        <div tabIndex={0} />
        <div className={contentClasses} tabIndex={0}>
          <div className='oo-ui-window-head'>{head}</div>
          <div className='oo-ui-window-body'>{children}</div>
          <div className='oo-ui-window-foot'>{foot}</div>
        </div>
        <div tabIndex={0} />
      </div>
      <div className='oo-ui-window-overlay' />
    </div>
  );
};

export default Dialog;
