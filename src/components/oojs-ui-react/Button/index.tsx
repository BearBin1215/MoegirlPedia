import React, { useState } from 'react';
import classNames from 'classnames';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../props';
import type { ButtonFlag } from '../utils';
import type { AccessKeyElement, IconElement, IndicatorElement } from '../mixin';

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
  rel?: string[];

  /** 要插入文本 */
  text?: string;

  /** 内部<a>标签的title */
  title?: string;
}

const Button: FunctionComponent<ButtonProps> = ({
  active,
  accessKey,
  children,
  classes,
  disabled,
  framed = true,
  flags = [],
  href,
  icon,
  indicator,
  rel = [],
  text,
  title,
  ...rest
}) => {
  const [pressed, setPressed] = useState(false);

  const iconInvert = flags.includes('primary') || disabled || active;
  const iconDestructive = !flags.includes('primary')
    && flags.includes('destructive')
    && !disabled
    && !active;

  /** 根据参数生成按钮类 */
  const buttonClassName = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-buttonElement',
    framed ? 'oo-ui-buttonElement-framed' : 'oo-ui-buttonElement-frameless',
    icon && 'oo-ui-iconElement',
    children && 'oo-ui-labelElement',
    indicator && 'oo-ui-indicatorElement',
    typeof flags === 'string' ? [flags] : flags.map((flag) => `oo-ui-flaggedElement-${flag}`),
    'oo-ui-buttonWidget',
    active && 'oo-ui-buttonElement-active',
    pressed && !disabled && 'oo-ui-buttonElement-pressed',
  );

  const indicatorClasses = classNames(
    iconInvert && 'oo-ui-image-invert',
    iconDestructive && 'oo-ui-image-destructive',
  );

  const iconClasses = classNames(
    iconInvert && 'oo-ui-image-invert',
    iconDestructive && 'oo-ui-image-destructive',
  );

  const anchorRel = rel ? rel.join(' ') : 'nofollow';

  return (
    <span
      {...rest}
      className={buttonClassName}
      onMouseUp={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseLeave={() => setPressed(false)}
      aria-disabled={false}
    >
      {text}
      <a
        className='oo-ui-buttonElement-button'
        role='button'
        tabIndex={0}
        href={href}
        rel={anchorRel}
        title={title}
        accessKey={accessKey}
      >
        <IconBase icon={icon} classes={iconClasses} />
        <span className='oo-ui-labelElement-label'>{children}</span>
        <IndicatorBase indicator={indicator} classes={indicatorClasses} />
      </a>
    </span>
  );
};

export default Button;
