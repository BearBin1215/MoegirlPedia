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
import { generateWidgetClassName } from '../../../utils/tool';
import type { WidgetProps } from '../Widget';
import type { ButtonFlag } from '../../../types/utils';
import type { AccessKeyElement, IconElement, IndicatorElement } from '../../../types/mixin';

export interface ButtonProps extends
  WidgetProps<HTMLSpanElement>,
  AccessKeyElement,
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

  /** 按住鼠标 */
  const handlePress: MouseEventHandler<HTMLSpanElement> = () => {
    if (!disabled) {
      setPressed(true);
    }
  };

  /** 松开或移出 */
  const handleUnpress: MouseEventHandler<HTMLSpanElement> = () => {
    if (!disabled) {
      setPressed(false);
    }
  };

  /** 按下Enter键等同点击鼠标 */
  const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
    if (onKeyDown) {
      onKeyDown(ev);
    }
    if (!disabled && ev.key === 'Enter') {
      handlePress(ev as unknown as MouseEvent<HTMLSpanElement>);
    }
  };

  /** 松开Enter键等同松开鼠标 */
  const handleKeyUp: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
    if (onKeyUp) {
      onKeyUp(ev);
    }
    if (!disabled && ev.key === 'Enter') {
      handleUnpress(ev as unknown as MouseEvent<HTMLSpanElement>);
      handleClick(ev as unknown as MouseEvent<HTMLSpanElement>);
    }
  };

  return (
    <span
      {...rest}
      ref={ref}
      className={classes}
      onClick={handleClick}
      onMouseUp={handleUnpress}
      onMouseDown={handlePress}
      onMouseLeave={handleUnpress}
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
