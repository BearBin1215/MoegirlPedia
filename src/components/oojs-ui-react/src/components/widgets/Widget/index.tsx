import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import { processClassNames } from '../../../utils/tool';
import type { ElementProps } from '../Element';
import type { ElementRef } from '../../../types/ref';

export interface WidgetProps<T = HTMLDivElement> extends Omit<ElementProps<T>, 'defaultValue' | 'onChange'> {
  /** 是否禁用 */
  disabled?: boolean;
}

const Widget = forwardRef<ElementRef<HTMLDivElement>, WidgetProps<HTMLDivElement>>(({
  children,
  className,
  disabled,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    processClassNames({ disabled }),
  );
  const elementRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }));

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      ref={elementRef}
    >
      {children}
    </div>
  );
});

Widget.displayName = 'Widget';

export default Widget;
