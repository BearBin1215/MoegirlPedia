import React, {
  useState,
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

export type ButtonFlag = IconFlag | 'primary' | 'safe' | 'back' | 'close';

export interface ButtonProps extends
  Omit<WidgetProps<HTMLSpanElement>, 'onClick' | 'rel'>,
  AccessKeyedElement,
  IconElement,
  IndicatorElement {

  /** 是否为激活状态 */
  active?: boolean;

  /** 是否生成边框 */
  framed?: boolean;

  /** 附加给按钮的标志 */
  flags?: ButtonFlag | ButtonFlag[];

  /** 按钮跳转链接。原版会执行isSafeUrl净化，本工程省略 */
  href?: string;

  /** 链接打开位置（<a>的target） */
  target?: string;

  /** 内部<a>标签的rel属性（等价原版ButtonWidget的rel配置，数组以空格拼接） */
  rel?: string | string[];

  /** 内部<a>标签的title */
  title?: string;

  /** 图标title提示（等价原版ButtonElement的iconTitle配置） */
  iconTitle?: string;

  /** 指示器title提示（等价原版ButtonElement的indicatorTitle配置） */
  indicatorTitle?: string;

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
  target,
  icon,
  iconTitle,
  indicator,
  indicatorTitle,
  rel = ['nofollow'],
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
  /**
   * 按压态，由JS维护并输出`oo-ui-buttonElement-pressed`类，对齐原版ButtonElement：
   * 键盘为Enter/空格按下与抬起（CSS无法实现键盘按压）；鼠标为左键按下加类，
   * mouseup可能发生在按钮外，通过document级capture监听复位（原版onDocumentMouseUp同款）
   */
  const [pressed, setPressed] = useState(false);
  const flagList = typeof flags === 'string' ? [flags] : flags;
  const relList = typeof rel === 'string' ? [rel] : rel;

  /** 按wikimediaui主题规则生成图标/指示器变体类 */
  let iconClasses: string | undefined;
  if (framed && (active || disabled || flagList.includes('primary'))) {
    iconClasses = 'oo-ui-image-invert';
  } else if (!disabled) {
    iconClasses = clsx(
      flagList.includes('progressive') && 'oo-ui-image-progressive',
      flagList.includes('destructive') && 'oo-ui-image-destructive',
      flagList.includes('invert') && 'oo-ui-image-invert',
      flagList.includes('error') && 'oo-ui-image-error',
      flagList.includes('warning') && 'oo-ui-image-warning',
      flagList.includes('success') && 'oo-ui-image-success',
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

  /** 松开鼠标，状态变更为unpressed */
  const handleMouseUp: MouseEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled) {
      setPressed(false);
    }
    if (onMouseUp) {
      onMouseUp(ev);
    }
  };

  /** 对齐原版onMouseDown/onDocumentMouseUp：左键按下进入按压态；mouseup可能发生在按钮外，用document级capture监听确保复位 */
  const handleMouseDown: MouseEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled && ev.button === 0) {
      setPressed(true);
      const onDocumentMouseUp = () => {
        setPressed(false);
        document.removeEventListener('mouseup', onDocumentMouseUp, true);
      };
      document.addEventListener('mouseup', onDocumentMouseUp, true);
    }
    if (onMouseDown) {
      onMouseDown(ev);
    }
  };

  /** 按下Enter或空格键等同按下鼠标（键盘按压态无法用CSS实现，需JS维护） */
  const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled && (ev.key === 'Enter' || ev.key === ' ')) {
      setPressed(true);
    }
    if (onKeyDown) {
      onKeyDown(ev);
    }
  };

  /** 松开Enter或空格键，复位键盘按压态 */
  const handleKeyUp: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled && (ev.key === 'Enter' || ev.key === ' ')) {
      setPressed(false);
    }
    if (onKeyUp) {
      onKeyUp(ev);
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
      onKeyUp={handleKeyUp}
      aria-disabled={!!disabled}
    >
      <a
        className='oo-ui-buttonElement-button'
        role='button'
        tabIndex={disabled ? -1 : (tabIndex ?? 0)}
        href={disabled ? undefined : href}
        target={target}
        rel={relList.join(' ') || undefined}
        title={title}
        accessKey={accessKey}
      >
        <IconBase
          icon={icon}
          className={clsx(iconClasses, !icon && 'oo-ui-iconElement-noIcon')}
          title={iconTitle}
        />
        <LabelBase>{children}</LabelBase>
        <IndicatorBase
          indicator={indicator}
          className={clsx(iconClasses, !indicator && 'oo-ui-indicatorElement-noIndicator')}
          title={indicatorTitle}
        />
      </a>
    </span>
  );
});

Button.displayName = 'Button';

export default Button;
