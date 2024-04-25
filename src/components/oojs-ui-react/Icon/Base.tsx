import React from 'react';
import classNames from 'classnames';
import type { HTMLAttributes, FunctionComponent } from 'react';
import type { IconElement } from '../mixin';

export interface IconBaseProps extends HTMLAttributes<HTMLDivElement>, IconElement {
  classes?: string | string[];
}

const IconBase: FunctionComponent<IconBaseProps> = ({
  classes,
  icon,
  ...rest
}) => {
  const iconClassName = classNames(
    'oo-ui-iconElement-icon',
    icon && `oo-ui-iconElement-${icon}`,
    classes,
  );

  return <span className={iconClassName} {...rest} />;
};

export default IconBase;
