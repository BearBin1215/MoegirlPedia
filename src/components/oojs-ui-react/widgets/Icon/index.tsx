import React from 'react';
import classNames from 'classnames';
import IconBase from './Base';
import { processClassNames } from '../../utils/tool';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../../types/props';
import type { IconFlag } from '../../types/utils';
import type { IconElement } from '../../types/mixin';

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
    processClassNames({ disabled, icon }, 'icon'),
    (typeof flags === 'string' ? [flags] : flags).map((flag) => `oo-ui-flaggedElement-${flag} oo-ui-image-${flag}`),
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
