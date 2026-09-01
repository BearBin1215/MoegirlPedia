import React, { memo } from 'react';
import type { ReactNode } from 'react';

export interface LogLineProps {
  /** 日志内容 */
  text: ReactNode;

  /** 文字颜色 */
  color: string;

  /** 时间前缀，留空则不渲染 */
  time?: string;

  /** 附加类名 */
  className?: string;
}

/**
 * 单条日志行
 *
 * 使用自定义比较函数而非默认的浅比较：父级每次渲染都会重建行内样式对象，
 * 默认比较会因此判定为“已变化”而全量重渲染，批量日志场景下成本可观。
 */
const LogLine = memo(
  ({ text, color, time, className }: LogLineProps) => (
    <li
      className={className}
      style={{ color }}
    >
      {time
        ? `${time} - `
        : ''}
      {text}
    </li>
  ),
  (prev, next) => prev.text === next.text
    && prev.color === next.color
    && prev.time === next.time
    && prev.className === next.className,
);

LogLine.displayName = 'LogLine';

export default LogLine;
