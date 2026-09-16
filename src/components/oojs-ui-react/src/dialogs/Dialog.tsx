import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  forwardRef,
  useRef,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { debounce } from 'es-toolkit';
import type { ElementProps } from '../Element';
import { getFocusableElements } from '../utils';
import { useLatestRef } from '../hooks';
import { acquireScrollLock, releaseScrollLock } from './scrollLock';
import { WindowManager } from './WindowManager';

/**
 * 弹窗开关动画时序（ms），对齐主题CSS的window动画：active为打开即展开，setupDelay/readyDelay
 * 为打开阶段的后续延时，closeDuration为关闭缩小淡出时长
 */
export const DIALOG_ANIMATION = { setupDelay: 60, readyDelay: 120, closeDuration: 250 } as const;

/** frame过渡时长（与closeDuration同源，单位为s） */
const DIALOG_TRANSITION = `${DIALOG_ANIMATION.closeDuration / 1000}s`;

/** frame宽度档位（px），'full'不入表（宽度交由CSS满屏） */
const DIALOG_FRAME_WIDTHS = { small: 300, medium: 500, large: 700, larger: 900 } as const;

/**
 * 以head/body/foot实测内容高度撑起frame：先把frame钳到0再测量——三者绝对定位，
 * 其scrollHeight即可反映内容溢出的真实高度（%高度链虽塌陷，溢出内容始终计入）。
 * height不在transition范围内，钳0立即生效，测完设置最终高度即paint前就位
 */
function measureContentHeight(
  frame: HTMLDivElement,
  head: HTMLDivElement,
  body: HTMLDivElement,
  foot: HTMLDivElement,
): void {
  frame.style.height = '0px';
  const totalHeight =
    head.scrollHeight +
    body.scrollHeight +
    foot.scrollHeight +
    frame.offsetHeight - frame.clientHeight;
  frame.style.height = `${totalHeight}px`;
}

export interface DialogProps extends ElementProps<HTMLDivElement> {
  /** 弹窗大小（缺省medium） */
  size?: 'small' | 'medium' | 'large' | 'larger' | 'full';
  /** 弹窗是否为打开状态 */
  open: boolean;
  /** 弹窗头部 */
  head?: ReactNode,
  /** 弹窗尾部 */
  foot?: ReactNode,
  /**
   * 挂载于content容器内的浮层内容（与head/body/foot同级，配合绝对定位类覆盖整个弹窗），
   * 对齐原版挂载于$content的元素（如ProcessDialog的错误面板）。普通内容仍走children（body区）
   */
  overlay?: ReactNode,
  /** 附加类 */
  contentClassName?: string,
  /** 是否允许按ESC关闭 */
  escapable?: boolean,
  /** 按下ESC时的回调，由调用方负责关闭弹窗 */
  onEscape?: () => void,
  /** 按下Ctrl/Cmd+Enter时的回调（对应primary动作） */
  onPrimaryAction?: () => void,
  /** 打开动画完成（ready）后的回调，此时可执行聚焦等操作 */
  onReady?: () => void,
}

/**
 * 弹窗组件，对齐原版Window/Dialog：经WindowManager渲染到portal，打开依次进入
 * active→setup→ready动画态（时序见DIALOG_ANIMATION），关闭播缩小淡出；非full尺寸下
 * 由head/body/foot实测内容高度撑起frame，带焦点陷阱与ESC/Ctrl+Enter快捷键
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(({
  className,
  contentClassName,
  size = 'medium',
  open,
  head,
  children,
  foot,
  overlay,
  escapable = true,
  onEscape,
  onPrimaryAction,
  onReady,
  onKeyDown,
  ...rest
}, ref) => {
  // size='full'时恒为满屏；窄屏自动满屏在updateSize判定
  const [full, setFull] = useState(size === 'full');
  const [ready, setReady] = useState(false);
  const [setup, setSetup] = useState(false);
  const [active, setActive] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  // 打开前的焦点元素，关闭teardown后归还焦点
  const returnFocusRef = useRef<HTMLElement | null>(null);
  // 滚动锁登记句柄：实例内恒定的空对象，作为scrollLock登记表的key
  const scrollLockHandleRef = useRef({});

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

  // 显式标注为number | false：'full'为false（宽度交由CSS满屏），其余取档位表
  const frameWidth: number | false = size === 'full' ? false : DIALOG_FRAME_WIDTHS[size];

  // 测量读取的渲染期状态（active/setup/size/frameWidth）：经ref读取，使测量函数与监听
  // 恒为最新闭包（不必用依赖数组驱动重挂）
  const frameStateRef = useLatestRef({ active, setup, size, frameWidth });

  /**
   * 重算frame高度：非满屏且视窗容得下时，以head/body/foot实测内容高度撑起frame，
   * 否则满屏；测量仅限setup稳定期以避开动画过渡态
   */
  const measureFrame = useCallback(() => {
    const {
      active: activeNow,
      setup: setupNow,
      size: sizeNow,
      frameWidth: frameWidthNow,
    } = frameStateRef.current;
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    if (sizeNow === 'full') {
      // 满屏尺寸：宽高交由CSS（oo-ui-windowManager-size-full），清空内联高度避免覆盖
      setFull(true);
      frame.style.height = '';
      return;
    }
    if (frameWidthNow && frameWidthNow > window.innerWidth) {
      setFull(true);
      // 窄屏下将高度、宽度设为100%
      frame.style.height = '100%';
      return;
    }
    setFull(false);
    const headEl = headRef.current;
    const bodyEl = bodyRef.current;
    const footEl = footRef.current;
    if (!activeNow || !setupNow || !headEl || !bodyEl || !footEl) {
      // 仅在setup（布局稳定期）测量；其他阶段测量会被动画过渡态污染
      return;
    }
    measureContentHeight(frame, headEl, bodyEl, footEl);
  }, [frameStateRef]);

  // 高度重算的订阅源合一：head/foot内容变化（RO，即时）与视窗尺寸变化（resize，防抖200ms）。
  // 经ref读取最新状态，故监听只在挂载时建立一次，不随active/setup变化重挂。
  // 不观察body——原版同样不因body内容变化重算，溢出由body内部滚动承接；
  // head/foot为绝对定位，measureFrame对frame钳0不会反向改变其尺寸，无RO循环
  useEffect(() => {
    const observer = new ResizeObserver(() => measureFrame());
    if (headRef.current) {
      observer.observe(headRef.current);
    }
    if (footRef.current) {
      observer.observe(footRef.current);
    }
    const onResize = debounce(() => measureFrame(), 200);
    window.addEventListener('resize', onResize);
    return () => {
      // 卸载后取消trailing调用，避免操作已卸载组件的ref
      onResize.cancel();
      window.removeEventListener('resize', onResize);
      observer.disconnect();
    };
  }, [measureFrame]);

  // setup拍在paint前设置最终高度（对齐原版setup()中updateSize先于addClass的时序）：
  // 动画期间布局即为最终布局，scale缩放纯靠transform，不产生滚动条，复现原版"从中间由小变大"。
  // frameWidth入依赖：size变化时宽度与测量基准同时变化，须在同一帧重算高度
  useLayoutEffect(() => {
    if (active && setup) {
      measureFrame();
    }
  }, [active, setup, frameWidth, measureFrame]);

  // 键盘行为，对齐原版Dialog.prototype.onDialogKeyDown：原版将keydown绑定在弹窗自身
  // $element上（焦点须在弹窗内才生效），故此处用React的onKeyDown而非document级监听，
  // 也因此不会与Popup的document级捕获ESC监听（如弹窗内FieldsetLayout帮助弹层）互相触发。
  // ESC触发onEscape（配合escapable），Ctrl/Cmd+Enter触发primary action
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) => {
    if (!active) {
      return;
    }
    if (ev.key === 'Escape' && escapable) {
      ev.preventDefault();
      ev.stopPropagation();
      onEscape?.();
    } else if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey) && onPrimaryAction) {
      ev.preventDefault();
      ev.stopPropagation();
      onPrimaryAction();
    }
    onKeyDown?.(ev);
  };

  // onReady经ref取最新：调用方多传内联函数，其引用变化不应在open期间反复触发重聚焦
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // 对齐原版：ready时先聚焦弹窗内容，再交由onReady自定义聚焦（如MessageDialog聚焦primary按钮）
  useEffect(() => {
    if (active && ready) {
      contentRef.current?.focus();
      onReadyRef.current?.();
    }
  }, [active, ready]);

  /**
   * 焦点陷阱重定向，对齐原版Window.prototype.onFocusTrapFocused/focus：
   * Tab到达前/后陷阱时把焦点送回content内末/首个可聚焦元素；content内无可聚焦元素时
   * 回退聚焦content自身（tabIndex=-1可编程聚焦），使Tab在弹窗内闭环
   */
  const focusIntoContent = (backwards: boolean) => {
    const content = contentRef.current;
    if (!content) {
      return;
    }
    const focusables = getFocusableElements(content);
    const target = backwards ? focusables[focusables.length - 1] : focusables[0];
    if (target) {
      target.focus();
    } else {
      content.focus();
    }
  };

  // 打开前焦点元素：open置位时记录，teardown后归还；
  // 焦点已在弹窗内容内时不记录（如重复打开），归还到弹窗自身没有意义
  useEffect(() => {
    if (open) {
      const el = document.activeElement;
      returnFocusRef.current = el instanceof HTMLElement && !contentRef.current?.contains(el) ? el : null;
    }
  }, [open]);

  // 关闭（hold态）时移出弹窗内焦点，避免焦点滞留于即将隐藏的元素
  useEffect(() => {
    if (!open && active) {
      const el = document.activeElement;
      if (el && contentRef.current?.contains(el)) {
        (el as HTMLElement).blur();
      }
    }
  }, [open, active]);

  // teardown（active移除）后归还打开前焦点；
  // 触发元素可能已随页面更新卸载，经isConnected校验避免聚焦失效节点
  useEffect(() => {
    if (!open && !active) {
      const target = returnFocusRef.current;
      if (target?.isConnected) {
        target.focus();
      }
      returnFocusRef.current = null;
    }
  }, [open, active]);

  // 开关动画控制，对齐原版生命周期（计时器统一入数组，随open翻转整体清理）
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (open) {
      // 打开：active（dialog展开，frame以scale(0.5)+透明可见）→ setup（scale→1+淡入）→ ready
      timers.push(setTimeout(() => setActive(true)));
      timers.push(setTimeout(() => setSetup(true), DIALOG_ANIMATION.setupDelay));
      timers.push(setTimeout(() => setReady(true), DIALOG_ANIMATION.readyDelay));
    } else {
      // 关闭：hold（立即移除setup，播放closeDuration缩小淡出）→ teardown（移除active隐藏）
      timers.push(setTimeout(() => {
        setReady(false);
        setSetup(false);
      }));
      timers.push(setTimeout(() => setActive(false), DIALOG_ANIMATION.closeDuration));
    }
    return () => timers.forEach(clearTimeout);
  }, [open]);

  // 滚动锁：打开周期（open||active）内经scrollLock登记，body/html获得modal-active类锁定
  // 背景滚动。对齐原版toggleGlobalEvents的上锁窗口（openWindow同步上锁、teardown完成解锁），
  // 故判定用open||active而非open——关闭动画期间保持锁定；full翻转（窄屏自动满屏）经依赖
  // 重新登记同步fullscreen变体。清理对称注销，StrictMode双调用下登记收敛
  useEffect(() => {
    const handle = scrollLockHandleRef.current;
    if (open || active) {
      acquireScrollLock(handle, full);
    } else {
      releaseScrollLock(handle);
    }
    return () => releaseScrollLock(handle);
  }, [open, active, full]);

  return (
    <WindowManager
      full={full}
      size={size}
      aria-hidden={!active}
    >
      <div
        {...rest}
        className={classes}
        role='dialog'
        onKeyDown={handleKeyDown}
        ref={ref}
      >
        <div
          className='oo-ui-window-frame'
          style={{
            // 只过渡opacity与transform（对齐原版"由小变大"动画），height即时生效，
            // 避免高度过渡期间body溢出产生滚动条
            transition: `opacity ${DIALOG_TRANSITION} ease 0s, transform ${DIALOG_TRANSITION} ease 0s`,
            width: full ? '100%' : `${frameWidth}px`,
          }}
          ref={frameRef}
        >
          <div
            className='oo-ui-window-focusTrap'
            tabIndex={0}
            onFocus={() => focusIntoContent(true)}
          />
          <div className={contentClasses} tabIndex={-1} ref={contentRef}>
            <div className='oo-ui-window-head' ref={headRef}>{head}</div>
            <div className='oo-ui-window-body' ref={bodyRef}>{children}</div>
            <div className='oo-ui-window-foot' ref={footRef}>{foot}</div>
            {overlay}
          </div>
          <div
            className='oo-ui-window-focusTrap'
            tabIndex={0}
            onFocus={() => focusIntoContent(false)}
          />
        </div>
        <div className='oo-ui-window-overlay' />
      </div>
    </WindowManager>
  );
});

Dialog.displayName = 'Dialog';

