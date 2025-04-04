import React, {
  useState,
  forwardRef,
  type MouseEventHandler,
} from 'react';
import classNames from 'classnames';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { processClassNames } from '../../../utils/tool';
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
  ...rest
}, ref) => {
  const [pressed, setPressed] = useState(false);

  const iconInvert = flags.includes('primary') || disabled || active;
  const iconDestructive = !flags.includes('primary')
    && flags.includes('destructive')
    && !disabled
    && !active;

  /** 根据参数生成按钮类 */
  const classes = classNames(
    className,
    processClassNames({
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

  const imageClasses = classNames(
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
  const handlePress = () => {
    if (!disabled) {
      setPressed(true);
    }
  };

  /** 松开或移出 */
  const handleUnpress = () => {
    if (!disabled) {
      setPressed(false);
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
      aria-disabled={!!disabled}
      tabIndex={tabIndex}
    >
      <a
        className='oo-ui-buttonElement-button'
        role='button'
        tabIndex={tabIndex ?? 0}
        href={href}
        rel={rel}
        title={title}
        accessKey={accessKey}
      >
        <IconBase icon={icon} className={imageClasses} />
        <LabelBase>{children}</LabelBase>
        <IndicatorBase indicator={indicator} className={imageClasses} />
      </a>
    </span>
  );
});

Button.displayName = 'Button';

export default Button;
