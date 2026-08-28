import React, {
  useState,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useRef,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { debounce } from 'es-toolkit';
import type { ElementProps } from '../Element';
import WindowManager from './WindowManager';

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
  /** 是否允许按ESC关闭，对齐原版`static.escapable` */
  escapable?: boolean,
  /** 按下ESC时的回调，由调用方负责关闭弹窗 */
  onEscape?: () => void,
  /** 按下Ctrl/Cmd+Enter时的回调，对齐原版触发primary action的行为 */
  onPrimaryAction?: () => void,
  /** 打开动画完成（ready）后的回调，此时可执行聚焦等操作 */
  onReady?: () => void,
}

const Dialog = forwardRef<HTMLDivElement, DialogProps>(({
  className,
  contentClassName,
  size = 'small',
  open,
  head,
  children,
  foot,
  escapable = true,
  onEscape,
  onPrimaryAction,
  onReady,
  ...rest
}, ref) => {
  const [full, setFull] = useState(false);
  const [ready, setReady] = useState(false);
  const [setup, setSetup] = useState(false);
  const [active, setActive] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);

  const classes = clsx(
    className,
    'oo-ui-window',
    'oo-ui-dialog',
    setup && 'oo-ui-window-setup',
    ready && 'oo-ui-window-ready',
    active ? 'oo-ui-window-active' : 'oo-ui-element-hidden',
  );

  const contentClasses = clsx(
    'oo-ui-window-content',
    'oo-ui-dialog-content',
    contentClassName,
    ready && 'oo-ui-window-content-ready',
    setup && 'oo-ui-window-content-setup',
  );

  const frameWidth = (() => {
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
  })();

  // 更新弹窗尺寸
  const updateSize = () => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    if (frameWidth && frameWidth > window.innerWidth) {
      setFull(true);
      // 窄屏下将高度、宽度设为100%
      frame.style.height = '100%';
      return;
    }
    setFull(false);
    if (!active || !setup || !headRef.current || !bodyRef.current || !footRef.current) {
      // 仅在setup（布局稳定期）测量；其他阶段测量会被动画过渡态污染
      return;
    }
    // 先将frame钳制到0再测量：head/body/foot（绝对定位）的scrollHeight即可反映
    // 内容溢出的真实高度；%高度链虽塌陷，但溢出内容始终计入scrollHeight。
    // height不在transition范围内，钳0立即生效，测完设置最终高度即paint前就位。
    frame.style.height = '0px';
    const totalHeight =
      headRef.current.scrollHeight +
      bodyRef.current.scrollHeight +
      footRef.current.scrollHeight +
      frame.offsetHeight - frame.clientHeight;
    frame.style.height = `${totalHeight}px`;
  };

  // 监听视窗宽度变化（setup需入依赖：updateSize闭包读取setup，漏掉时监听持有旧闭包而早退，打开后resize不再重算高度）
  useEffect(() => {
    const onResize = debounce(updateSize, 200);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [active, setup, frameWidth]);

  // setup拍在paint前设置最终高度（对齐原版setup()中updateSize先于addClass的时序）：
  // 动画期间布局即为最终布局，scale缩放纯靠transform，不产生滚动条，复现原版"从中间由小变大"
  useLayoutEffect(() => {
    if (active && setup) {
      updateSize();
    }
  }, [active, setup, frameWidth]);

  // 键盘行为，对齐原版Dialog.prototype.onDialogKeyDown：
  // ESC触发onEscape（配合escapable），Ctrl/Cmd+Enter触发primary action
  useEffect(() => {
    if (!active) {
      return;
    }
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && escapable) {
        ev.preventDefault();
        ev.stopPropagation();
        onEscape?.();
      } else if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
        if (onPrimaryAction) {
          ev.preventDefault();
          ev.stopPropagation();
          onPrimaryAction();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, escapable, onEscape, onPrimaryAction]);

  // 对齐原版：ready时先聚焦弹窗内容，再交由onReady自定义聚焦（如MessageDialog聚焦primary按钮）
  useEffect(() => {
    if (active && ready) {
      contentRef.current?.focus();
      onReady?.();
    }
  }, [active, ready, onReady]);

  useEffect(() => {
    if (!open && active) {
      const el = document.activeElement;
      if (el && contentRef.current?.contains(el)) {
        (el as HTMLElement).blur();
      }
    }
  }, [open]);

  // 开关动画控制，对齐原版生命周期：
  // 打开：active（dialog展开，frame以scale(0.5)+透明可见）→ setup（scale→1+淡入）→ ready
  // 关闭：hold（立即移除setup，播放250ms缩小淡出）→ teardown（移除active隐藏）
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;
    if (open) {
      t1 = setTimeout(() => setActive(true));
      t2 = setTimeout(() => setSetup(true), 60);
      t3 = setTimeout(() => setReady(true), 120);
    } else {
      t1 = setTimeout(() => {
        setReady(false);
        setSetup(false);
      });
      t3 = setTimeout(() => setActive(false), 250);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [open]);

  return (
    <WindowManager
      full={full}
      aria-hidden={!active}
    >
      <div
        {...rest}
        className={classes}
        ref={ref}
      >
        <div
          className='oo-ui-window-frame'
          role='dialog'
          style={{
            // 只过渡opacity与transform（对齐原版"由小变大"动画），height即时生效，
            // 避免高度过渡期间body溢出产生滚动条
            transition: 'opacity 0.25s ease 0s, transform 0.25s ease 0s',
            width: full ? '100%' : `${frameWidth}px`,
          }}
          ref={frameRef}
        >
          <div tabIndex={0} />
          <div className={contentClasses} tabIndex={0} ref={contentRef}>
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
});

Dialog.displayName = 'Dialog';

export default Dialog;
