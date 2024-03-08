import React, { useState } from 'react';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../Widget';
import type { IconWidgetProps } from '../IconWidget';
import type { IndicatorWidgetProps } from '../IndicatorWidget';

export type Flag = 'progressive' | 'destructive' | 'primary';

export interface ButtonWidgetProps extends WidgetProps<HTMLSpanElement>, IconWidgetProps, IndicatorWidgetProps {
  /** 是否为激活状态 */
  active?: boolean;

  /** 是否生成边框 */
  framed?: boolean;

  /** 附加给按钮的标志 */
  flags?: Flag[];

  /** 按钮跳转链接 */
  href?: string;

  /** 内部<a>标签的rel属性列表 */
  rel?: string[];

  /** 要插入文本 */
  text?: string;

  /** 内部<a>标签的title */
  title?: string;
}

const ButtonWidget: FunctionComponent<ButtonWidgetProps> = ({
  active,
  children,
  classes,
  disabled,
  framed = true,
  flags = [],
  href,
  icon,
  id,
  indicator,
  onClick,
  ref,
  rel = [],
  text,
  title,
}) => {
  const [pressed, setPressed] = useState(false);

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
    ...flags.map((flag) => `oo-ui-flaggedElement-${flag}`),
    'oo-ui-buttonWidget',
    active && 'oo-ui-buttonElement-active',
    pressed && !disabled && 'oo-ui-buttonElement-pressed',
  );

  const indicatorClassName = classNames(
    'oo-ui-indicatorElement-indicator',
    indicator ? `oo-ui-indicator-${indicator}` : 'oo-ui-indicatorElement-noIndicator',
  );

  const iconClassName = classNames(
    'oo-ui-iconElement-icon',
    icon ? `oo-ui-icon-${icon}` : 'oo-ui-iconElement-noIcon',
    (flags.includes('primary') || disabled || active) && 'oo-ui-image-invert',
    (!flags.includes('primary') && flags.includes('destructive') && !disabled && !active) && 'oo-ui-image-destructive',
  );

  const anchorRel = rel ? rel.join(' ') : 'nofollow';

  return (
    <span
      id={id}
      className={buttonClassName}
      onClick={onClick}
      onMouseUp={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseLeave={() => setPressed(false)}
      aria-disabled={false}
      ref={ref}
    >
      {text}
      <a
        className='oo-ui-buttonElement-button'
        role='button'
        tabIndex={0}
        href={href}
        rel={anchorRel}
        title={title}
      >
        <span className={iconClassName} />
        <span className='oo-ui-labelElement-label'>{children}</span>
        <span className={indicatorClassName} />
      </a>
    </span>
  );
};

export default ButtonWidget;
