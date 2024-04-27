import type { ReactNode } from 'react';
import type { Indicator } from './utils';

export interface AccessKeyElement {
  /** 组件访问键 */
  accessKey?: string;
}

export interface LabelElement {
  /** 标签文字 */
  label?: ReactNode;
}

export interface IconElement {
  /** 组件图标 */
  icon?: string;
}

export interface IndicatorElement {
  /** 组件指示器 */
  indicator?: Indicator;
}
