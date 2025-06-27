import type { ReactNode, HTMLAttributes } from 'react';
import type { Indicators } from './utils';

/** 基础元素属性 */
export type ElementProps<T = HTMLDivElement> = HTMLAttributes<T>;

export interface AccessKeyElement {
  /** 快捷键 */
  accessKey?: string;
}

export interface LabelElement {
  /** 标签显示内容 */
  label?: ReactNode;
}

export interface IconElement {
  /**
   * 组件图标
   * @see https://doc.wikimedia.org/oojs-ui/master/demos/?page=icons
   */
  icon?: string;
}

export interface IndicatorElement {
  /** 组件指示器 */
  indicator?: Indicators;
}
