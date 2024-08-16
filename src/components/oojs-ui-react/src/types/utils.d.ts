import type { ChangeEvent } from 'react';

export type IconFlag = 'progressive' | 'destructive';

export type ButtonFlag = IconFlag | 'primary' | 'safe' | 'back' | 'close';

export type LabelPosition = 'before' | 'after';

export type Indicators = 'clear' | 'up' | 'down' | 'required';

/** 组件change钩子参数 */
export interface ChangeValue<T = any, P = HTMLElement> {
  /** 变更后新值 */
  value: T;

  /** 变更前旧值 */
  oldValue?: T;

  /** 发生变化的dom事件 */
  event?: ChangeEvent<P>;
}

/** 组件值变化钩子函数 */
export type ChangeHandler<T = any, P = HTMLElement> = (change: ChangeValue<T, P>) => void;
