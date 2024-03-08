import React, { useState } from 'react';
import classnames from 'classnames';

interface ButtonWidgetProps {
  /** 是否为激活状态 */
  active?: boolean;

  /** 元素的额外类 */
  classes?: string[];

  /** 是否为禁用状态 */
  disabled?: boolean;

  /** 是否生成边框 */
  framed?: boolean;

  /** 附加给按钮的标志 */
  flags?: string[];

  /** 按钮跳转链接 */
  href?: string;

  /** 按钮前方图标 */
  icon?: string;

  /** HTML元素的id */
  id?: string;

  /** 按钮后方指示器 */
  indicator?: string;

  /** 按钮内容 */
  label?: React.ReactNode;

  /** 按钮内容 */
  children?: React.ReactNode;

  /** 要插入文本 */
  text?: string;

  /** 内部<a>标签的title属性 */
  title?: string;

  /** 内部<a>标签的rel属性列表 */
  rel?: string[];

  /** 点击按钮触发的回调函数 */
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
}

const ButtonWidget: React.FC<ButtonWidgetProps> = ({
  label,
  text,
  id,
  title,
  icon,
  flags = [],
  indicator,
  framed = true,
  href,
  rel = [],
  classes = [],
  disabled,
  active,
  onClick,
}) => {
  const [pressed, setPressed] = useState(false);

  /** 根据参数生成按钮类 */
  const buttonClassName = classnames(
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-buttonElement',
    framed ? 'oo-ui-buttonElement-framed' : 'oo-ui-buttonElement-frameless',
    icon && 'oo-ui-iconElement',
    (label) && 'oo-ui-labelElement',
    indicator && 'oo-ui-indicatorElement',
    ...flags.map((flag) => `oo-ui-flaggedElement-${flag}`),
    'oo-ui-buttonWidget',
    active && 'oo-ui-buttonElement-active',
    pressed && !disabled && 'oo-ui-buttonElement-pressed',
    ...classes,
  );

  const indicatorClassName = classnames(
    'oo-ui-indicatorElement-indicator',
    indicator ? `oo-ui-indicator-${indicator}` : 'oo-ui-indicatorElement-noIndicator',
  );

  const iconClassName = classnames(
    'oo-ui-iconElement-icon',
    icon ? `oo-ui-icon-${icon}` : 'oo-ui-iconElement-noIcon',
    (flags.includes('primary') || disabled || active) && 'oo-ui-image-invert',
    (!flags.includes('primary') && flags.includes('destructive') && !disabled && !active) && 'oo-ui-image-destructive',
  );

  const anchorRel = rel ? rel.join(' ') : 'nofollow';

  return (
    <span
      className={buttonClassName}
      onClick={onClick}
      id={id}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
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
        <span className='oo-ui-labelElement-label'>{label}</span>
        <span className={indicatorClassName} />
      </a>
    </span>
  );
};

export default ButtonWidget;
