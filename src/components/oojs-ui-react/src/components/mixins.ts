import type { ChangeEvent } from 'react';

/** 快捷键元素参数 */
export interface AccessKeyedElement {
  /** 快捷键 */
  accessKey?: string;
}

/** 组件change钩子参数 */
export interface ChangeValue<T = any, P = HTMLElement> {
  /** 变更后新值 */
  value: T;

  /** 变更前旧值 */
  oldValue?: T;

  /** 发生变化的dom事件 */
  event?: ChangeEvent<P>;
}

/**
 * 组件值变化钩子函数
 * @example <TextInput value={text} onChange={({ value }) => setText(value) />
 */
export type ChangeHandler<T = any, P = HTMLElement> = (change: ChangeValue<T, P>) => void;
