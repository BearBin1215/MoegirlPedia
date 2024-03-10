import React, { useState } from 'react';
import type { ReactNode, HTMLAttributes, FunctionComponent } from 'react';
import '../index.less';

interface LogerInfo {
  /** 日志类型描述 */
  text: ReactNode;

  /** 颜色 */
  color?: string;

  /** 图标 */
  icon?: ReactNode;
}

export interface LogerType extends LogerInfo {
  name: string;
}

export interface LogerDetail {
  type: string;

  text: ReactNode;

  time: string;
}

export interface LogerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  logerTypes?: LogerType[];

  logerDetails?: LogerDetail[];
}

/**
 * 日志组件
 */
const Loger: FunctionComponent<LogerProps> = ({ logerTypes, logerDetails = [], ...props }) => {
  const [showTypes, setShowTypes] = useState((logerTypes?.map(({ name }) => name) || ['success', 'warn', 'error']));

  /**
   * 定义筛选按钮
   */
  const filterButtons = logerTypes ? logerTypes.reduce((acc, { name, ...rest }) => {
    acc[name] = rest;
    return acc;
  }, {} as Record<string, LogerInfo>) : {
    success: {
      color: '#333',
      icon: '✓',
      text: '完成',
    },
    warn: {
      color: '#f28500',
      icon: '!',
      text: '警告',
    },
    error: {
      color: '#eb3941',
      icon: '✕',
      text: '出错',
    },
  };

  /**
   * 控制日志筛选
   */
  const filtLogs = (typeName: string): void => {
    if (showTypes.includes(typeName)) {
      setShowTypes(showTypes.filter((type) => type !== typeName));
    } else {
      setShowTypes([...showTypes, typeName]);
    }
  };

  return (
    <div className='bearbintools-loger' {...props}>
      <div className='loger-body'>
        <nav className='loger-filter'>
          {Object.entries(filterButtons).map(([name, { color, icon, text }]) => {
            return (
              <div
                className={showTypes.includes(name) ? 'loger-filter-selected' : ''}
                key={name}
                style={{ color }}
                onClick={() => filtLogs(name)}
              >
                <span className='loger-filter-icon'>{icon}</span>
                <span className='loger-filter-count'>{logerDetails.filter(({ type }) => type === name).length}</span>
                {` ${text}`}
              </div>
            );
          })}
        </nav>
        <ul className='loger-lines'>
          {logerDetails.map(({ type, text, time }, index) => {
            return (
              <li key={index} style={{ color: filterButtons[type].color, display: showTypes.includes(type) ? '' : 'none' }}>
                {time} - {text}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Loger;
