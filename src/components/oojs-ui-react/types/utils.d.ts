import type { ChangeEvent } from 'react';

export type IconFlag = 'progressive' | 'destructive';

export type ButtonFlag = 'primary' | IconFlag;

export type LabelPosition = 'before' | 'after';

export type Indicator = 'clear' | 'up' | 'down' | 'required';

/** 组件change钩子参数 */
export interface ChangeValue<T = any, P = HTMLElement> {
  value: T;

  oldValue?: T;

  event?: ChangeEvent<P>;
}

/** 组件值变化钩子函数 */
export type ChangeHandler<T = any, P = HTMLElement> = (change?: ChangeValue<T, P>) => void;
