import React, { forwardRef, type HTMLAttributes, type Key } from 'react';

/** 基础元素参数 */
export interface ElementProps<T = HTMLDivElement> extends Omit<HTMLAttributes<T>, 'defaultValue' | 'defaultChecked'> {
  key?: Key,
};

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
