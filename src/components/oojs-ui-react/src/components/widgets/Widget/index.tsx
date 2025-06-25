import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { processClassNames } from '../../../utils/tool';
import type { ElementProps } from '../../../types/mixin';

export interface WidgetProps<T = HTMLDivElement> extends Omit<ElementProps<T>, 'defaultValue' | 'onChange'> {
  /** 是否禁用 */
  disabled?: boolean;
}

const Widget = forwardRef<HTMLDivElement, WidgetProps<HTMLDivElement>>(({
  children,
  className,
  disabled,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    processClassNames({ disabled }),
  );
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
