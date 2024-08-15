import React, { forwardRef, type HTMLAttributes } from 'react';
import classNames from 'classnames';
import type { IconElement } from '../../../types/mixin';

export interface IconBaseProps extends
  HTMLAttributes<HTMLSpanElement>,
  IconElement { }

const IconBase = forwardRef<HTMLSpanElement, IconBaseProps>(({
  className,
  icon,
  ...rest
}, ref) => {
  const classes = classNames(
    'oo-ui-iconElement-icon',
    icon && `oo-ui-icon-${icon}`,
    className,
  );

  return <span ref={ref} {...rest} className={classes} />;
});

IconBase.displayName = 'IconBase';

export default IconBase;
