import type { ChangeEvent } from 'react';

export type IconFlag = 'progressive' | 'destructive';

export type ButtonFlag = 'primary' | IconFlag;

export type Indicator = 'clear' | 'up' | 'down' | 'required';

export interface InputChangeValue<T> {
  value: T;

  oldValue?: T;

  event: ChangeEvent<HTMLInputElement>;
}
