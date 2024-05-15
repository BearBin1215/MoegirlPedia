import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import type { HTMLAttributes } from 'react';
import type { ElementRef } from '../../types/ref';

/** 组件基础属性 */
export type ElementProps<T = HTMLDivElement> = HTMLAttributes<T>;

const Element = forwardRef<ElementRef<HTMLDivElement>, ElementProps>(({
  children,
  ...rest
}, ref) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }));

  return <div {...rest} ref={elementRef}>{children}</div>;
});

Element.displayName = 'Element';

export default Element;
