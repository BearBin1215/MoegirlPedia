import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { generateWidgetClassName, toFlagArray } from '../../utils';
import type { WidgetProps } from '../Widget';
import IconBase, { type IconElement } from './Base';

/** 主题支持的图标变体（对齐wikimediaui主题variants） */
export type IconFlag = 'progressive' | 'destructive' | 'invert' | 'error' | 'warning' | 'success';

export interface IconProps extends
  WidgetProps<HTMLSpanElement>,
  IconElement {

  /** 附加给图标的标志 */
  flags?: IconFlag | IconFlag[];

  /** 图标title提示 */
  iconTitle?: string;
}

/** 独立图标组件，对齐原版OO.ui.IconWidget：基于IconBase附加Widget类名与flag变体 */
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
    generateWidgetClassName({ disabled, icon }, 'icon'),
    // 单元素组件：根元素即label元素（原版IconWidget混入LabelElement时$label指向根），
    // invisibleLabel的裁剪类按原版落在label（根）上
    'oo-ui-labelElement-invisible',
    toFlagArray(flags).flatMap((flag) => [`oo-ui-flaggedElement-${flag}`, `oo-ui-image-${flag}`]),
  );

  return (
    <IconBase
      {...rest}
      className={classes}
      icon={icon}
      title={title ?? iconTitle}
      aria-disabled={disabled || undefined}
      ref={ref}
    />
  );
});

Icon.displayName = 'Icon';

export default Icon;
export { IconElement };
