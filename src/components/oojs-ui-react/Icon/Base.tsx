import React from 'react';
import classNames from 'classnames';
import type { HTMLAttributes, FunctionComponent } from 'react';
import type { IconElement } from '../types/mixin';

export interface IconBaseProps extends
  HTMLAttributes<HTMLSpanElement>,
  IconElement { }

const IconBase: FunctionComponent<IconBaseProps> = ({
  className,
  icon,
  ...rest
}) => {
  const iconClassName = classNames(
    'oo-ui-iconElement-icon',
    icon && `oo-ui-icon-${icon}`,
    className,
  );

  return <span {...rest} className={iconClassName} />;
};

export default IconBase;
