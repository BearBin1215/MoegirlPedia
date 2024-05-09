/**
 * @todo 打开、关闭动画
 */
import React, { useState, useRef, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import WindowManager from './WindowManager';
import type { ElementProps } from '../widgets/Element';
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
  /** 附加类 */
  contentClassName?: string,
}

const Dialog: FunctionComponent<DialogProps> = ({
  className,
  contentClassName,
  size = 'small',
  open,
  head,
  children,
  foot,
  ...rest
}) => {
  const [full, setFull] = useState(false);
  const [ready, setReady] = useState(false);
  const [setup, setSetup] = useState(false);
  const [active, setActive] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);

  const classes = classNames(
    className,
    'oo-ui-window',
    'oo-ui-dialog',
    setup && 'oo-ui-window-setup',
    ready && 'oo-ui-window-ready',
    active ? 'oo-ui-window-active' : 'oo-ui-element-hidden',
  );

  const contentClasses = classNames(
    'oo-ui-window-content',
    'oo-ui-dialog-content',
    contentClassName,
    ready && 'oo-ui-window-content-ready',
    setup && 'oo-ui-window-content-setup',
  );

  const frameWidth = useMemo(() => {
    switch (size) {
      case 'full':
        return false;
      case 'large':
        return 700;
      case 'larger':
        return 900;
      case 'small':
        return 300;
      case 'medium':
      default:
        return 500;
    }
  }, [size]);

  // 更新弹窗尺寸
  const updateSize = () => {
    if (frameRef.current) {
      if (frameWidth && frameWidth > window.innerWidth) {
        setFull(true);
        // 窄屏下将高度、宽度设为100%
        frameRef.current.style.height = '100%';
      } else {
        setFull(false);
        // 宽屏下根据内容动态调整高度
        if (active && headRef.current && bodyRef.current && footRef.current) {
          frameRef.current.style.height = '1px';
          bodyRef.current.style.position = 'relative';
          const totalHeight =
            headRef.current.scrollHeight +
            bodyRef.current.scrollHeight +
            footRef.current.scrollHeight +
            frameRef.current.offsetHeight - frameRef.current.clientHeight;
          frameRef.current.style.height = `${totalHeight}px`;
          bodyRef.current.style.position = '';
        }
      }
    }
  };

  // 监听视窗宽度变化
  useEffect(() => {
    const onResize = debounce(updateSize, 200);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [headRef, bodyRef, footRef]);

  // 打开弹窗时初始化弹窗尺寸
  useEffect(() => {
    updateSize();
  }, [active]);

  // 开关动画控制
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setActive(true);
        setSetup(true);
        setTimeout(() => setReady(true));
      });
    } else {
      setTimeout(() => {
        setReady(false);
        setTimeout(() => {
          setSetup(false);
          setActive(false);
        }, 250);
      });
    }
  }, [open]);

  return (
    <WindowManager
      full={full}
      aria-hidden={!active}
    >
      <div
        {...rest}
        className={classes}
      >
        <div
          className='oo-ui-window-frame'
          role='dialog'
          style={{
            transition: 'all 0.25s ease 0s',
            width: full ? '100%' : `${frameWidth}px`,
            height: '1px',
          }}
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
