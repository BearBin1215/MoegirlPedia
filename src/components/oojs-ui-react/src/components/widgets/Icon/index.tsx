import React, { forwardRef } from 'react';
import classNames from 'classnames';
import IconBase from './Base';
import { processClassNames } from '../../../utils/tool';
import type { WidgetProps } from '../Widget';
import type { IconFlag } from '../../../types/utils';
import type { IconElement } from '../../../types/mixin';

export interface IconProps extends
  Omit<WidgetProps<HTMLSpanElement>, 'children'>,
  IconElement {

  flags?: IconFlag | IconFlag[];
}

const Icon = forwardRef<HTMLSpanElement, IconProps>(({
  icon,
  className,
  disabled,
  flags = [],
  ...rest
}, ref) => {

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
      ref={ref}
    />
  );
});

Icon.displayName = 'Icon';

export default Icon;
