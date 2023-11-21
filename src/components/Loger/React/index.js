import React, { Component } from 'react';
import './index.less';

/**
 * 日志组件
 */
export default class Loger extends Component {
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

    LogerData = {
        detail: [],
        count: {},
    };

    /**
     * 清空
     */
    clear = () => {
        this.LogerData.detail.length = 0;
        for (const key in this.LogerData.count) {
            this.LogerData.count[key] = 0;
        }
    };

    constructor(props) {
        super(props);
        if (props.filterButtons) {
            this.filterButtons = props.filterButtons;
        }
        this.LogerData = props.value;
    }

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
                                <button key={name} style={{ color }}>
                                    <span className='loger-filter-icon'>{icon}</span>
                                    <span className='loger-filter-count'>{this.LogerData.count[name]}</span>
                                    {` ${text}`}
                                </button>
                            );
                        })}
                    </nav>
                    <ul className='loger-lines'>
                        {this.LogerData.detail.map(({ id, type, text }) => {
                            console.log(id, type, text);
                            return (
                                <li key={id} style={{ color: this.filterButtons[type].color }}>
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