import { createElement, FunctionComponent } from 'react';
import type { ReactNode, RefObject, MouseEventHandler, CSSProperties } from 'react';

/** 组件基础属性 */
export interface ElementProps<T> {
  id?: string;

  children?: ReactNode;

  ref?: RefObject<T>;

  onClick?: MouseEventHandler<T>;

  /** 要加入到组件class属性后的其他属性 */
  classes?: string[];

  style?: CSSProperties;
}

const Element: FunctionComponent<ElementProps<HTMLDivElement>> = (props) => {
  return createElement('div', props);
};

export default Element;
