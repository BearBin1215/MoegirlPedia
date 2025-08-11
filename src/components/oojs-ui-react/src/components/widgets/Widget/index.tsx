import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { generateWidgetClassName } from '../../../utils/tool';
import type { ElementProps } from '../../Element';

export interface WidgetProps<T = HTMLDivElement> extends Omit<ElementProps<T>, 'onChange'> {
  /** 是否禁用 */
  disabled?: boolean;
}

const Widget = forwardRef<HTMLDivElement, WidgetProps<HTMLDivElement>>(({
  children,
  className,
  disabled,
  ...rest
}, ref) => {
  const classes = clsx(className, generateWidgetClassName({ disabled }));

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      ref={ref}
    >
      {children}
    </div>
  );
});

Widget.displayName = 'Widget';

export default Widget;
