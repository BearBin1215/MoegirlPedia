/**
 * @description 配合Loger用于记录数据
 */

export default class Records {
    /**
     * 类型
     */
    types = {
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
     * 日志详情
     */
    detail = [];

    /**
     * 数量记录
     */
    count = {};

    /**
     * 创建一个Records对象
     * @param {string | undefined} types
     */
    constructor(types) {
        if (types) {
            this.types = types;
        }
        for (const type in this.types) {
            this.count[type] = 0;
        }
    }

    /**
     * 添加一条记录
     */
    record = (text, type = 'normal') => {
        this.detail.push({
            id: this.detail.length + 1,
            type,
            text,
        });
        console.log(this.count[type]);
        if (this.types[type]) {
            this.count[type]++;
        }
    };

    /**
     * 清空日志
     */
    clear = () => {
        this.detail.length = 0;
        for(const type in this.count) {
            this.count[type] = 0;
        }
    };
}