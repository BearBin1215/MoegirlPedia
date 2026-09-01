import React, { memo } from 'react';
import clsx from 'clsx';
import type { LogerCounts, LogerType } from './types';

export interface LogerFilterProps {
  /** 参与筛选的日志类型 */
  types: LogerType[];

  /** 各类型日志条数 */
  counts: LogerCounts;

  /** 当前被隐藏的类型名 */
  hiddenTypes: string[];

  /** 点击某个类型按钮时触发 */
  onToggle: (name: string) => void;
}

/**
 * 日志类型筛选栏
 *
 * 渲染为 div 列表以与原生版保持完全一致的结构与样式；通过 `role`、`tabIndex`
 * 与 `onKeyDown` 补回键盘可访问性，原生版本身不支持。
 */
const LogerFilter = memo(({ types, counts, hiddenTypes, onToggle }: LogerFilterProps) => {
  const handleKeyDown = (event: React.KeyboardEvent, name: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle(name);
    }
  };

  return (
    <nav className='loger-filter'>
      {types.map(({ name, icon, color, text }) => {
        const shown = !hiddenTypes.includes(name);
        return (
          <div
            key={name}
            className={clsx({ 'loger-filter-selected': shown })}
            style={{ color }}
            role='button'
            tabIndex={0}
            aria-pressed={shown}
            onClick={() => onToggle(name)}
            onKeyDown={(event) => handleKeyDown(event, name)}
          >
            {icon !== undefined
              ? <span className='loger-filter-icon'>{icon}</span>
              : null}
            <span className='loger-filter-count'>{counts[name] ?? 0}</span>
            {` ${text}`}
          </div>
        );
      })}
    </nav>
  );
});

LogerFilter.displayName = 'LogerFilter';

export default LogerFilter;
