import React, { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

/** 图标元素参数 */
export interface IconElement {
  /**
   * 组件图标
   * @see https://doc.wikimedia.org/oojs-ui/master/demos/?page=icons
   */
  icon?: string;
}

export type IconBaseProps =
  HTMLAttributes<HTMLSpanElement> &
  IconElement;

const IconBase = forwardRef<HTMLSpanElement, IconBaseProps>(({
  className,
  icon,
  ...rest
}, ref) => {
  const classes = clsx(
    'oo-ui-iconElement-icon',
    icon && `oo-ui-icon-${icon}`,
    className,
  );

  return <span ref={ref} {...rest} className={classes} />;
});

IconBase.displayName = 'IconBase';

export default IconBase;
