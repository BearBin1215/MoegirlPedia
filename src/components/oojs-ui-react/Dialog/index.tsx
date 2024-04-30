import React, { useRef, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import WindowManager from '../WindowManager';
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
  const frameRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    /**
     * 更新弹窗高度
     * @ps 你*的为什么用这么难受的手段，用top: 50%; left: 50%; transform: translate(-50%, -50%);不好吗
     */
    const calculateHeight = () => {
      if (open && frameRef.current && headRef.current && bodyRef.current && footRef.current) {
        bodyRef.current.classList.remove('oo-ui-window-body');
        const totalHeight =
          headRef.current.scrollHeight +
          bodyRef.current.scrollHeight +
          footRef.current.scrollHeight +
          frameRef.current.offsetHeight - frameRef.current.clientHeight;
        bodyRef.current.classList.add('oo-ui-window-body');

        // 更新frame的高度
        frameRef.current.style.height = `${totalHeight}px`;
      }
    };

    setTimeout(() => {
      calculateHeight();
    });
    window.addEventListener('resize', calculateHeight);

    // 清理函数
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };

  }, [open, headRef, bodyRef, footRef]);

  return (
    <WindowManager>
      <div
        {...rest}
        className={classes}
      >
        <div
          className='oo-ui-window-frame'
          role='dialog'
          style={{ transition: 'all 0.25s ease 0s', width: frameWidth }}
          ref={frameRef}
        >
          <div tabIndex={0} />
          <div className={contentClasses} tabIndex={0}>
            <div className='oo-ui-window-head' ref={headRef}>{head}</div>
            <div className='oo-ui-window-body' ref={bodyRef}>{children}</div>
            <div className='oo-ui-window-foot' ref={footRef}>{foot}</div>
          </div>
          <div tabIndex={0} />
        </div>
        <div className='oo-ui-window-overlay' />
      </div>
    </WindowManager>
  );
};

export default Dialog;
