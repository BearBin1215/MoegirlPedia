import React from 'react';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../props';
import type { IconFlag } from '../utils';
import type { IconElement } from '../mixin';

export interface IconWidgetProps extends
  Omit<WidgetProps<HTMLSpanElement>, 'children'>,
  IconElement {

  flags?: IconFlag | IconFlag[];
}

const IconWidget: FunctionComponent<IconWidgetProps> = ({
  icon,
  classes,
  disabled,
  flags = [],
  ...rest
}) => {
  const className = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-iconElement',
    'oo-ui-iconElement-icon',
    icon && `oo-ui-icon-${icon}`,
    (typeof flags === 'string' ? [flags] : flags).map((flag) => `oo-ui-flaggedElement-${flag} oo-ui-image-${flag}`),
    'oo-ui-iconWidget',
  );

  return (
    <span
      className={className}
      aria-disabled={false}
      {...rest}
    />
  );
};

export default IconWidget;
