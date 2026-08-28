import type { HTMLAttributes } from 'react';

/** 基础元素参数（对齐原版抽象基类Element，仅类型，无对应渲染组件） */
export type ElementProps<T = HTMLDivElement> = Omit<HTMLAttributes<T>, 'defaultValue' | 'defaultChecked'>;
