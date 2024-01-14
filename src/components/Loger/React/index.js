import React, { Component } from 'react';
import './index.less';

/**
 * 日志组件
 */
export default class Loger extends Component {
  state = {};

  /**
   * 定义筛选按钮
   */
  filterButtons = {
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

  logerData = {
    detail: [],
    count: {},
  };

  constructor(props) {
    super(props);
    if (props.records) {
      this.logerData = props.records;
      this.filterButtons = props.records.types;
    } else if (props.filterButtons) {
      this.logerData = props.value;
      this.filterButtons = props.filterButtons;
    }
    for (const type in this.filterButtons) {
      this.state[type] = true;
    }
  }

  /**
   * 清空
   */
  clear = () => {
    if (this.logerData.clear) {
      this.logerData.clear();
    } else {
      this.logerData.detail.length = 0;
      for (const key in this.logerData.count) {
        this.logerData.count[key] = 0;
      }
    }
    this.setState({});
  };

  render() {
    return (
      <div className='bearbintools-loger'>
        <h3 className='loger-headline'>
          日志
          <a onClick={this.clear} className='loger-clear'>
            [清空]
          </a>
        </h3>
        <div className='loger-body'>
          <nav className='loger-filter'>
            {Object.entries(this.filterButtons).map(([name, { color, icon, text }]) => {
              return (
                <button
                  className='loger-filter-selected'
                  key={name}
                  style={{ color }}
                  onClick={({ currentTarget }) => {
                    currentTarget.classList.toggle('loger-filter-selected');
                    this.setState({
                      [name]: !this.state[name],
                    });
                  }}
                >
                  <span className='loger-filter-icon'>{icon}</span>
                  <span className='loger-filter-count'>{this.logerData.count[name]}</span>
                  {` ${text}`}
                </button>
              );
            })}
          </nav>
          <ul className='loger-lines'>
            {this.logerData.detail.map(({ id, type, text }) => {
              return (
                <li
                  key={id}
                  style={{
                    color: this.filterButtons[type].color,
                    display: this.state[type] ? '' : 'none',
                  }}
                >
                  {text}
                </li>
              );
            })}
          </ul>
        </div>
      </div >
    );
  }
}