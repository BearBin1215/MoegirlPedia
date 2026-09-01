import type { ReactNode } from 'react';

/**
 * 日志类型的展示信息
 */
export interface LogerTypeInfo {
  /** 类型图标，显示在筛选按钮上 */
  icon?: ReactNode;

  /** 类型颜色，同时用于筛选按钮与日志行文字 */
  color: string;

  /** 类型名称，显示在筛选按钮上 */
  text: ReactNode;
}

/**
 * 日志类型定义
 */
export interface LogerType extends LogerTypeInfo {
  /**
   * 类型唯一标识
   *
   * 只有登记在 {@link LogerProps.types} 中的类型才会出现在筛选栏并参与计数；
   * 未登记的日志一律显示且不受筛选影响。
   */
  name: string;
}

/**
 * 单条日志
 */
export interface LogerDetail {
  /**
   * 日志类型名，对应 {@link LogerType.name}
   *
   * 留空或传入未登记的类型时，日志始终显示、颜色取兜底色、不参与计数与筛选。
   */
  type?: string;

  /** 日志内容 */
  text: ReactNode;

  /** 时间前缀，留空则不渲染时间 */
  time?: string;

  /**
   * 稳定唯一标识
   *
   * 受控模式下缺省会退化为数组下标，筛选或截断后可能变化进而导致整行重建；
   * 高频追加场景建议显式传入以保证行组件缓存命中。
   */
  id?: string | number;
}

/**
 * 各类型的日志条数，键为 {@link LogerType.name}
 */
export type LogerCounts = Record<string, number>;

/**
 * 命令式操作句柄，通过 `ref` 获取
 */
export interface LogerRef {
  /**
   * 追加一条日志，`time` 缺省时取当前时间
   *
   * @returns 该条日志的 id
   */
  record: (detail: LogerDetail) => string | number;

  /**
   * 批量追加日志，仅触发一次重渲染
   *
   * @returns 新增日志的 id 列表
   */
  recordMany: (details: LogerDetail[]) => (string | number)[];

  /** 清空全部日志 */
  clear: () => void;

  /** 滚动到日志末尾 */
  scrollToBottom: () => void;

  /** 日志列表元素 */
  readonly element: HTMLUListElement | null;
}

/** 未在 types 中登记的日志所使用的兜底颜色，与原生版 Loger 保持一致 */
export const UNKNOWN_TYPE_COLOR = '#222';

/** 未传 types 时使用的默认日志类型 */
export const DEFAULT_LOGER_TYPES: LogerType[] = [
  {
    name: 'success',
    icon: '✓',
    color: '#333',
    text: '完成',
  },
  {
    name: 'warn',
    icon: '!',
    color: '#f28500',
    text: '警告',
  },
  {
    name: 'error',
    icon: '✕',
    color: '#eb3941',
    text: '出错',
  },
];
