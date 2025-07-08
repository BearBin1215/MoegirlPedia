import type { ReactNode, HTMLAttributes } from 'react';
import type { Indicators } from './utils';

/** 基础元素参数 */
export type ElementProps<T = HTMLDivElement> = Omit<HTMLAttributes<T>, 'defaultValue' | 'defaultChecked'>;

/** 快捷键元素参数 */
export interface AccessKeyElement {
  /** 快捷键 */
  accessKey?: string;
}

export interface LabelElement {
  /** 标签显示内容 */
  label?: ReactNode;
}

/** 图标元素参数 */
export interface IconElement {
  /**
   * 组件图标
   * @see https://doc.wikimedia.org/oojs-ui/master/demos/?page=icons
   */
  icon?: string;
}

/** 指示器元素参数 */
export interface IndicatorElement {
  /** 组件指示器 */
  indicator?: Indicators;
}
