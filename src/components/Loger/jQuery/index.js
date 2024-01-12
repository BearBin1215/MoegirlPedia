import Loger from '../index';

export default class extends Loger {
    /**
     * 日志元素的jQuery对象
     */
    get $element() {
        return $(this.element);
    }

    /**
     * 标题的jQuery对象
     */
    get $headline() {
        return $(this.headline);
    }

    /**
     * 主体的jQuery对象
     */
    get $body() {
        return $(this.body);
    }
}