import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  type MouseEventHandler,
  type KeyboardEventHandler,
  type MouseEvent,
  type KeyboardEvent,
} from 'react';
import clsx from 'clsx';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { generateWidgetClassName, type AccessKeyedElement } from '../../utils';
import type { WidgetProps } from '../Widget';
import type { IconElement, IconFlag } from '../Icon';
import type { IndicatorElement } from '../Indicator';

export type ButtonFlag = IconFlag | 'primary' | 'safe' | 'back' | 'close' | 'invert';

export interface ButtonProps extends
  Omit<WidgetProps<HTMLSpanElement>, 'onClick'>,
  AccessKeyedElement,
  IconElement,
  IndicatorElement {

  /** 是否为激活状态 */
  active?: boolean;

  /** 是否生成边框 */
  framed?: boolean;

  /** 附加给按钮的标志 */
  flags?: ButtonFlag | ButtonFlag[];

  /** 按钮跳转链接 */
  href?: string;

  /** 内部<a>标签的rel属性列表 */
  rel?: string;

  /** 内部<a>标签的title */
  title?: string;

  /** 点击回调（键盘Enter/空格触发时ev为KeyboardEvent） */
  onClick?: (ev: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>) => void;
}

const Button = forwardRef<HTMLSpanElement, ButtonProps>(({
  active,
  accessKey,
  children,
  className,
  disabled,
  framed = true,
  flags = [],
  href,
  icon,
  indicator,
  rel = 'nofollow',
  title,
  tabIndex,
  onClick,
  onMouseDown,
  onMouseUp,
  onKeyDown,
  onKeyPress,
  onKeyUp,
  ...rest
}, ref) => {
  const [pressed, setPressed] = useState(false);
  const clearPressedRef = useRef<(() => void) | null>(null);
  const flagList = typeof flags === 'string' ? [flags] : flags;

  // 卸载时清理document上的释放监听，避免残留
  useEffect(() => () => clearPressedRef.current?.(), []);

  /**
   * 进入pressed状态，并在document上捕获式监听释放事件，
   * 以便焦点/按钮外松开时也能复位
   */
  function startPress(releaseType: 'mouseup', match: (e: globalThis.MouseEvent) => boolean): void;
  function startPress(releaseType: 'keyup', match: (e: globalThis.KeyboardEvent) => boolean): void;
  // 实现签名用宽松match以兼容两组重载的逆变，实际类型由重载约束
  function startPress(releaseType: 'mouseup' | 'keyup', match: (e: any) => boolean) {
    setPressed(true);
    clearPressedRef.current?.();
    const clear: EventListener = (e) => {
      if (match(e)) {
        setPressed(false);
        document.removeEventListener(releaseType, clear, true);
        clearPressedRef.current = null;
      }
    };
    clearPressedRef.current = () => document.removeEventListener(releaseType, clear, true);
    document.addEventListener(releaseType, clear, true);
  }

  /** 按wikimediaui主题规则生成图标/指示器变体类 */
  let iconClasses: string | undefined;
  if (framed && (active || disabled || flagList.includes('primary'))) {
    iconClasses = 'oo-ui-image-invert';
  } else if (!disabled) {
    iconClasses = clsx(
      flagList.includes('progressive') && 'oo-ui-image-progressive',
      flagList.includes('destructive') && 'oo-ui-image-destructive',
      flagList.includes('invert') && 'oo-ui-image-invert',
    );
  }

  /** 根据参数生成按钮类 */
  const classes = clsx(
    className,
    generateWidgetClassName({
      disabled,
      icon,
      label: children,
      indicator,
    }, 'button'),
    'oo-ui-buttonElement',
    framed ? 'oo-ui-buttonElement-framed' : 'oo-ui-buttonElement-frameless',
    flagList.map((flag) => `oo-ui-flaggedElement-${flag}`),
    active && 'oo-ui-buttonElement-active',
    pressed && !disabled && 'oo-ui-buttonElement-pressed',
  );

  /** 点击回调（键盘Enter/空格触发时ev为KeyboardEvent） */
  const handleClick: ButtonProps['onClick'] = (ev) => {
    if (!disabled && onClick) {
      onClick(ev);
    }
  };

  /** 按下左键，状态变更为pressed，并在document上监听mouseup以便按钮外松开时复位 */
  const handleMouseDown: MouseEventHandler<HTMLSpanElement> = (ev) => {
    // 注意：ButtonWidget覆写cancelButtonMouseDownEvents=false，不阻止默认行为以保留点击聚焦
    if (!disabled && ev.button === 0) {
      startPress('mouseup', (e) => e.button === 0);
    }
    if (onMouseDown) {
      onMouseDown(ev);
    }
  };

  /** 松开鼠标，状态变更为unpressed */
  const handleMouseUp: MouseEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled) {
      setPressed(false);
    }
    if (onMouseUp) {
      onMouseUp(ev);
    }
  };

  /** 按下Enter或空格键等同按下鼠标，并在document上监听keyup以便焦点外松开时复位 */
  const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled && (ev.key === 'Enter' || ev.key === ' ')) {
      startPress('keyup', (e) => e.key === 'Enter' || e.key === ' ');
    }
    if (onKeyDown) {
      onKeyDown(ev);
    }
  };

  /** 对齐原版onKeyPress：Enter/空格触发click，存在click监听时阻止默认行为（空格滚动页面） */
  const handleKeyPress: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled && (ev.key === 'Enter' || ev.key === ' ')) {
      if (onClick) {
        ev.preventDefault();
      }
      handleClick(ev);
    }
    if (onKeyPress) {
      onKeyPress(ev);
    }
  };

  return (
    <span
      {...rest}
      ref={ref}
      className={classes}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onKeyPress={handleKeyPress}
      onKeyUp={onKeyUp}
      aria-disabled={!!disabled}
      tabIndex={disabled ? -1 : tabIndex}
    >
      <a
        className='oo-ui-buttonElement-button'
        role='button'
        tabIndex={disabled ? -1 : (tabIndex ?? 0)}
        href={disabled ? undefined : href}
        rel={rel}
        title={title}
        accessKey={accessKey}
      >
        <IconBase icon={icon} className={clsx(iconClasses, !icon && 'oo-ui-iconElement-noIcon')} />
        <LabelBase>{children}</LabelBase>
        <IndicatorBase
          indicator={indicator}
          className={clsx(iconClasses, !indicator && 'oo-ui-indicatorElement-noIndicator')}
        />
      </a>
    </span>
  );
});

Button.displayName = 'Button';

export default Button;
