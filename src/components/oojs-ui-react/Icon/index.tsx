import React from 'react';
import classNames from 'classnames';
import IconBase from './Base';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../props';
import type { IconFlag } from '../utils';
import type { IconElement } from '../mixin';

export interface IconProps extends
  Omit<WidgetProps<HTMLSpanElement>, 'children'>,
  IconElement {

  flags?: IconFlag | IconFlag[];
}

const Icon: FunctionComponent<IconProps> = ({
  icon,
  className,
  disabled,
  flags = [],
  ...rest
}) => {
  const classes = classNames(
    className,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-iconElement',
    (typeof flags === 'string' ? [flags] : flags).map((flag) => `oo-ui-flaggedElement-${flag} oo-ui-image-${flag}`),
    'oo-ui-iconWidget',
  );

  return (
    <IconBase
      {...rest}
      className={classes}
      icon={icon}
      aria-disabled={!!disabled}
    />
  );
};

export default Icon;
