import type { ChangeEvent } from 'react';

export type IconFlag = 'progressive' | 'destructive';

export type ButtonFlag = 'primary' | IconFlag;

export type LabelPosition = 'before' | 'after';

export type Indicator = 'clear' | 'up' | 'down' | 'required';

/** 输入框组件change钩子参数 */
export interface InputChangeValue<T> {
  value: T;

  oldValue?: T;

  event: ChangeEvent<HTMLInputElement>;
}
