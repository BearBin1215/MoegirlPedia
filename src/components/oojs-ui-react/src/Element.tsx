import React, { forwardRef, type HTMLAttributes } from 'react';

/** 基础元素参数 */
export type ElementProps<T = HTMLDivElement> = Omit<HTMLAttributes<T>, 'defaultValue' | 'defaultChecked'>;

const Element = forwardRef<HTMLDivElement, ElementProps<HTMLDivElement>>(({
  children,
  ...rest
}, ref) => (
  <div
    {...rest}
    ref={ref}
  >
    {children}
  </div>
));

Element.displayName = 'Element';

export default Element;
