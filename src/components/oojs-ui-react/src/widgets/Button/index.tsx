import React, {
  useState,
  forwardRef,
  type MouseEventHandler,
  type KeyboardEventHandler,
  type MouseEvent,
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
  WidgetProps<HTMLSpanElement>,
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
  onKeyUp,
  ...rest
}, ref) => {
  const [pressed, setPressed] = useState(false);

  /** primary、禁用、激活状态下样式反转 */
  const iconInvert = flags.includes('primary') || disabled || active;
  const iconDestructive = !flags.includes('primary')
    && flags.includes('destructive')
    && !disabled
    && !active;

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
    (typeof flags === 'string' ? [flags] : flags).map((flag) => `oo-ui-flaggedElement-${flag}`),
    active && 'oo-ui-buttonElement-active',
    pressed && !disabled && 'oo-ui-buttonElement-pressed',
  );

  const iconClasses = clsx(
    iconInvert && 'oo-ui-image-invert',
    iconDestructive && 'oo-ui-image-destructive',
  );

  /** 点击回调 */
  const handleClick: MouseEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled && onClick) {
      onClick(ev);
    }
  };

  /** 按下鼠标，状态变更为pressed */
  const handleMouseDown: MouseEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled) {
      setPressed(true);
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

  /** 按下Enter键等同点击鼠标 */
  const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled && ev.key === 'Enter') {
      setPressed(true);
    }
    if (onKeyDown) {
      onKeyDown(ev);
    }
  };

  /** 松开Enter键等同松开鼠标 */
  const handleKeyUp: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled && ev.key === 'Enter') {
      setPressed(false);
      handleClick(ev as unknown as MouseEvent<HTMLSpanElement>);
    }
    if (onKeyUp) {
      onKeyUp(ev);
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
      onKeyUp={handleKeyUp}
      aria-disabled={!!disabled}
      tabIndex={disabled ? -1 : tabIndex}
    >
      <a
        className='oo-ui-buttonElement-button'
        role='button'
        tabIndex={disabled ? -1 : (tabIndex ?? 0)}
        href={href}
        rel={rel}
        title={title}
        accessKey={accessKey}
      >
        <IconBase icon={icon} className={iconClasses} />
        <LabelBase>{children}</LabelBase>
        <IndicatorBase indicator={indicator} className={iconClasses} />
      </a>
    </span>
  );
});

Button.displayName = 'Button';

export default Button;
