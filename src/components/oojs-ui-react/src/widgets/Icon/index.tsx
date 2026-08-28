import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { generateWidgetClassName } from '../../utils';
import type { WidgetProps } from '../Widget';
import IconBase, { type IconElement } from './Base';

/** 主题支持的图标变体（对齐wikimediaui主题variants） */
export type IconFlag = 'progressive' | 'destructive' | 'invert' | 'error' | 'warning' | 'success';

export interface IconProps extends
  WidgetProps<HTMLSpanElement>,
  IconElement {

  /** 附加给图标的标志 */
  flags?: IconFlag | IconFlag[];

  /** 图标title提示（等价原版IconElement的iconTitle配置） */
  iconTitle?: string;
}

const Icon = forwardRef<HTMLSpanElement, IconProps>(({
  icon,
  className,
  disabled,
  flags = [],
  iconTitle,
  title,
  ...rest
}, ref) => {

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, icon, invisibleLabel: true }, 'icon'),
    !icon && 'oo-ui-iconElement-noIcon',
    (typeof flags === 'string' ? [flags] : flags).flatMap((flag) => [`oo-ui-flaggedElement-${flag}`, `oo-ui-image-${flag}`]),
  );

  return (
    <IconBase
      {...rest}
      className={classes}
      icon={icon}
      title={title ?? iconTitle}
      aria-disabled={disabled}
      ref={ref}
    />
  );
});

Icon.displayName = 'Icon';

export default Icon;
export { IconElement };
