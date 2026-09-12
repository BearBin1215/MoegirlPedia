import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { getWidgetClassName } from '../../utils';
import type { ElementProps } from '../../Element';

export interface WidgetProps<T = HTMLDivElement> extends Omit<ElementProps<T>, 'onChange'> {
  /** 是否禁用 */
  disabled?: boolean;
}

export const Widget = forwardRef<HTMLDivElement, WidgetProps<HTMLDivElement>>(({
  children,
  className,
  disabled,
  ...rest
}, ref) => {
  const classes = clsx(className, getWidgetClassName({ disabled }));

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      {children}
    </div>
  );
});

Widget.displayName = 'Widget';

