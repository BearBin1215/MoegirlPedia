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
import { getFocusableElements } from '../utils';
import { WindowManager } from './WindowManager';

/**
 * 弹窗开关动画时序（ms），对齐主题CSS的window动画：active为打开即展开，setupDelay/readyDelay
 * 为打开阶段的后续延时，closeDuration为关闭缩小淡出时长
 */
export const DIALOG_ANIMATION = { setupDelay: 60, readyDelay: 120, closeDuration: 250 } as const;

/** frame过渡时长（与closeDuration同源，单位为s） */
const DIALOG_TRANSITION = `${DIALOG_ANIMATION.closeDuration / 1000}s`;

export interface DialogProps extends ElementProps<HTMLDivElement> {
  /** 弹窗大小（缺省medium） */
  size?: 'small' | 'medium' | 'large' | 'larger' | 'full';
  /** 弹窗是否为打开状态 */
  open: boolean;
  /** 弹窗头部 */
  head?: ReactNode,
  /** 弹窗尾部 */
  foot?: ReactNode,
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

  /**
   * 重算frame高度：非满屏且视窗容得下时，以head/body/foot实测scrollHeight之和撑起frame，
   * 否则满屏；测量仅限setup稳定期以避开动画过渡态（细节见函数内注释）
   */
  const updateSize = () => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    if (size === 'full') {
      // 满屏尺寸：宽高交由CSS（oo-ui-windowManager-size-full），清空内联高度避免覆盖
      setFull(true);
      frame.style.height = '';
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
      // 卸载后取消trailing调用，避免操作已卸载组件的ref
      onResize.cancel();
      window.removeEventListener('resize', onResize);
    };
  }, [active, setup, frameWidth]);

  // head/foot内容变化（动作集增减等）时重算高度，对齐原版Dialog.onActionsChange触发updateSize；
  // 不观察body——原版同样不因body内容变化重算，溢出由body内部滚动承接。
  // head/foot为绝对定位，updateSize对frame钳0测量不会反向改变其尺寸，无RO循环
  useEffect(() => {
    const observer = new ResizeObserver(updateSize);
    if (headRef.current) {
      observer.observe(headRef.current);
    }
    if (footRef.current) {
      observer.observe(footRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [active, setup, frameWidth]);

  // setup拍在paint前设置最终高度（对齐原版setup()中updateSize先于addClass的时序）：
  // 动画期间布局即为最终布局，scale缩放纯靠transform，不产生滚动条，复现原版"从中间由小变大"
  useLayoutEffect(() => {
    if (active && setup) {
      updateSize();
    }
  }, [active, setup, frameWidth]);

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

  // 开关动画控制，对齐原版生命周期：
  // 打开：active（dialog展开，frame以scale(0.5)+透明可见）→ setup（scale→1+淡入）→ ready
  // 关闭：hold（立即移除setup，播放250ms缩小淡出）→ teardown（移除active隐藏）
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;
    if (open) {
      t1 = setTimeout(() => setActive(true));
      t2 = setTimeout(() => setSetup(true), DIALOG_ANIMATION.setupDelay);
      t3 = setTimeout(() => setReady(true), DIALOG_ANIMATION.readyDelay);
    } else {
      t1 = setTimeout(() => {
        setReady(false);
        setSetup(false);
      });
      t3 = setTimeout(() => setActive(false), DIALOG_ANIMATION.closeDuration);
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

