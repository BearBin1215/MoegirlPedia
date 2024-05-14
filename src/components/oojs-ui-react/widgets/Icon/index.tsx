import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import IconBase from './Base';
import { processClassNames } from '../../utils/tool';
import type { WidgetProps } from '../../types/props';
import type { IconFlag } from '../../types/utils';
import type { IconElement } from '../../types/mixin';
import type { ElementRef } from '../../types/ref';

export interface IconProps extends
  Omit<WidgetProps<HTMLSpanElement>, 'children'>,
  IconElement {

  flags?: IconFlag | IconFlag[];
}

const Icon = forwardRef<ElementRef<HTMLSpanElement>, IconProps>(({
  icon,
  className,
  disabled,
  flags = [],
  ...rest
}, ref) => {
  const elementRef = useRef<HTMLSpanElement>(null);

  const classes = classNames(
    className,
    processClassNames({ disabled, icon }, 'icon'),
    (typeof flags === 'string' ? [flags] : flags).map((flag) => `oo-ui-flaggedElement-${flag} oo-ui-image-${flag}`),
  );

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }));

  return (
    <IconBase
      {...rest}
      className={classes}
      icon={icon}
      aria-disabled={!!disabled}
      ref={elementRef}
    />
  );
});

Icon.displayName = 'Icon';

export default Icon;
