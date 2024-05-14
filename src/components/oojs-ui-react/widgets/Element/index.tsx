import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import type { ReactNode, MouseEventHandler, CSSProperties } from 'react';
import type { ElementRef } from '../../types/ref';

/** 组件基础属性 */
export interface ElementProps<T = HTMLDivElement> {
  id?: string;

  children?: ReactNode;

  onClick?: MouseEventHandler<T>;

  className?: string;

  style?: CSSProperties;
}

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
