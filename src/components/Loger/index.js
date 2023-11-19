import './index.less';

/**
 * 根据html字符串创建节点
 * @param {string} html 
 * @returns {Element} 节点
 */
const createTag = (html) => {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.children[0];
};

export default class Loger {
    /**
     * @type {{[key: string]: {icon: string, color: string, text: string, show: boolean}}}
     */
    _logTypes = {
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

    /**
     * 记录日志详情
     * @type {Array<{node: HTMLAnchorElement, type: string}>}
     */
    logDetails = [];

    /**
     * 日志按钮
     * @type {{[key: string]: {button: HTMLAnchorElement, countElement: HTMLAnchorElement}}}
     */
    filterButtons = {};

    /**
     * 创建一个Loger对象
     * @param {Array<{
     *     name: string,
     *     icon: string | HTMLElement,
     *     color: string,
     *     text: string
     *     }>} logTypes 日志行类型及其属性
     * @param {string} id 元素id
     * @param {string} headlineTagName 标题元素标签名
     */
    constructor(logTypes = [], id = '', headlineTagName = 'h3') {
        if (logTypes.length > 0) {
            // 根据输入生成需要的类型
            this._logTypes = logTypes.reduce((pre, { name, icon, color, text }) => {
                pre[name] = {
                    icon,
                    color,
                    text,
                };
                return pre;
            }, {});
        }
        for (const key in this._logTypes) {
            // 默认显示
            this._logTypes[key].show = true;
        }

        // 标题
        this.headline = createTag(`<${headlineTagName} class="loger-headline"></${headlineTagName}>`);

        // 日志主体
        this.body = createTag('<div class="loger-body"></div>');

        // 日志行
        this.logerLines = createTag('<ul class="loger-lines"></ul>');

        // 清空按钮
        const clearButton = createTag('<a class="loger-clear">[清空]</a>');
        clearButton.addEventListener('click', () => {
            this.logDetails.length = 0;
            this.logerLines.innerHTML = '';
            for (const key in this.filterButtons) {
                this.filterButtons[key].countElement.innerText = '0';
            }
        });

        // 日志筛选区
        const logerFilter = createTag('<nav class="loger-filter"></nav>');

        // 筛选按钮
        for (const [type, { icon, color, text }] of Object.entries(this._logTypes)) {
            const button = createTag(`<div class="loger-filter-selected loger-${type}" style="color: ${color}"></div>`);

            const iconElement = createTag(`<span class="loger-filter-icon">${icon}</span>`);

            const countElement = createTag('<span class="loger-filter-count">0</span>');

            button.append(iconElement, countElement, ` ${text}`);

            // 添加点击隐藏/显示日志行事件
            button.addEventListener('click', () => {
                if (this._logTypes[type].show) {
                    button.classList.remove('loger-filter-selected'); // 按钮添加对应类
                    this.logerLines.classList.add(`loger-${type}-hidden`); // 日志行元素添加隐藏类
                    this.logDetails.filter((detail) => detail.type === type).forEach((detail) => {
                        detail.node.style.display = 'none';
                    });
                    this._logTypes[type].show = false; // 设置显示状态为false
                } else {
                    button.classList.add('loger-filter-selected');
                    this.logerLines.classList.remove(`loger-${type}-hidden`);
                    this.logDetails.filter((detail) => detail.type === type).forEach((detail) => {
                        detail.node.style.display = '';
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
        this.element = createTag(`<div class="bearbintools-loger" id="${id || ''}"></div>`);

        this.headline.append('日志', clearButton);
        this.body.append(logerFilter, this.logerLines);
        this.element.append(this.headline, this.body);
    }

    /**
     * 添加一条日志
     * @param {string} text 文本
     * @param {string} type 日志，接受HTML形式的字符串
     * @param {string} time 时间
     */
    record(text, type = 'normal', time = new Date().toLocaleTimeString()) {
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
            node: record,
            type,
        });
        if (this.filterButtons[type]) {
            this.filterButtons[type].countElement.innerText = +this.filterButtons[type].countElement.innerText + 1;
        }
    }
}