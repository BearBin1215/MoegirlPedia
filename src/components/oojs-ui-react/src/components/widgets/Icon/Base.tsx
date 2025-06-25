import React, { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';
import type { IconElement } from '../../../types/mixin';

export interface IconBaseProps extends
  HTMLAttributes<HTMLSpanElement>,
  IconElement { }

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
