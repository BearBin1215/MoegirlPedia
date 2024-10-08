import createElement from '@/utils/dom';
import './index.less';

/**
 * Loger对象的日志类型基础接口
 */
interface LogerProps {
  /**
   * 类型图标
   */
  icon: string | HTMLElement;

  /**
   * 类型颜色
   */
  color: string;

  /**
   * 类型文本
   */
  text: string;
}

/**
 * Loger对象的日志类型信息
 */
export interface LogerType extends LogerProps {
  /**
   * 日志类型名
   */
  name: string;
}

export interface LogType extends LogerProps {
  show?: boolean;
}

type LogTypes = Record<string, LogType>;

/**
 * 日志筛选按钮对象
 */
interface FilterButton {
  button: HTMLElement,
  countElement: HTMLElement,
}

/**
 * 日志行详情信息
 */
export interface LogDetail {
  /**
   * 日志行对应的HTML元素
   */
  element: HTMLElement,

  /**
   * 日志类型
   */
  type: string,
}

export default class Loger {
  private _logTypes: LogTypes = {
    success: {
      icon: '✓',
      color: '#333',
      text: '完成',
    },
    warn: {
      icon: '!',
      color: '#f28500',
      text: '警告',
    },
    error: {
      icon: '✕',
      color: '#eb3941',
      text: '出错',
    },
  };

  /** Loger对象的HTML元素 */
  element: HTMLDivElement;

  /** 标题HTML元素 */
  headline: HTMLElement;

  /** 日志主体HTML元素 */
  body = createElement('<div class="loger-body"></div>') as HTMLDivElement;

  /** 日志详情列表HTML元素 */
  logerLines = createElement('<ul class="loger-lines"></ul>') as HTMLUListElement;

  /**
   * 记录日志详情
   * @type {Array<{node: HTMLAnchorElement, type: string}>}
   */
  logDetails: LogDetail[] = [];

  /**
   * 日志按钮
   */
  filterButtons: Record<string, FilterButton> = {};

  /**
   * 创建一个Loger对象
   * @param logTypes 日志行类型及其属性
   * @param id 元素id
   * @param headlineTagName 标题元素标签名
   */
  constructor(logTypes: LogerType[] = [], id = '', headlineTagName = 'h3') {
    if (logTypes.length > 0) {
      // 根据输入生成需要的类型
      this._logTypes = logTypes.reduce((pre, { name, icon, color, text }) => {
        pre[name] = {
          icon,
          color,
          text,
        };
        return pre;
      }, {} as LogTypes);
    }
    for (const key in this._logTypes) {
      // 默认显示
      this._logTypes[key].show = true;
    }

    // 标题
    this.headline = createElement(`<${headlineTagName} class="loger-headline"></${headlineTagName}>`);

    // 清空按钮
    const clearButton = createElement('<a class="loger-clear">[清空]</a>') as HTMLAnchorElement;
    clearButton.addEventListener('click', this.clear.bind(this));

    // 日志筛选区
    const logerFilter = createElement('<nav class="loger-filter"></nav>');

    // 筛选按钮
    for (const [type, { icon, color, text }] of Object.entries(this._logTypes)) {
      const button = createElement(`<div class="loger-filter-selected loger-${type}" style="color:${color}"></div>`);

      const iconElement = createElement('<span class="loger-filter-icon"></span>');
      iconElement.append(icon);

      const countElement = createElement('<span class="loger-filter-count">0</span>');

      button.append(iconElement, countElement, ` ${text}`);

      // 添加点击隐藏/显示日志行事件
      button.addEventListener('click', () => {
        if (this._logTypes[type].show) {
          button.classList.remove('loger-filter-selected'); // 按钮添加对应类
          this.logerLines.classList.add(`loger-${type}-hidden`); // 日志行元素添加隐藏类
          this.logDetails.filter((detail) => detail.type === type).forEach((detail) => {
            detail.element.style.display = 'none';
          });
          this._logTypes[type].show = false; // 设置显示状态为false
        } else {
          button.classList.add('loger-filter-selected');
          this.logerLines.classList.remove(`loger-${type}-hidden`);
          this.logDetails.filter((detail) => detail.type === type).forEach((detail) => {
            detail.element.style.display = '';
          });
          this._logTypes[type].show = true;
        }
      });

      this.filterButtons[type] = {
        button,
        countElement,
      };

      logerFilter.appendChild(button);
    }

    // 创建日志元素
    this.element = createElement(`<div class="bearbintools-loger" id="${id || ''}"></div>`) as HTMLDivElement;

    this.headline.append('日志', clearButton);
    this.body.append(logerFilter, this.logerLines);
    this.element.append(this.headline, this.body);
  }

  /**
   * 添加一条日志
   * @param text 文本
   * @param type 日志，接受HTML形式的字符串
   * @param time 时间
   */
  record(text: string, type = 'normal', time = new Date().toLocaleTimeString()) {
    const record = document.createElement('li');
    record.classList.add('loger-record', `loger-${type}`);
    record.innerHTML = `${time} - ${text}`;
    record.style.color = this._logTypes[type]?.color || '#222';

    // 根据选择状态决定是否显示
    if (this._logTypes[type]?.show === false) {
      record.style.display = 'none';
    }

    this.logerLines.appendChild(record);
    this.logerLines.scrollTop = this.logerLines.scrollHeight; // 日志滚动至底部
    this.logDetails.push({
      element: record,
      type,
    });
    if (this.filterButtons[type]) {
      this.filterButtons[type].countElement.innerText = String(+this.filterButtons[type].countElement.innerText + 1);
    }
    return record;
  }

  /** 清空日志 */
  clear() {
    this.logDetails.length = 0;
    this.logerLines.innerHTML = '';
    for (const key in this.filterButtons) {
      this.filterButtons[key].countElement.innerText = '0';
    }
  }
}
