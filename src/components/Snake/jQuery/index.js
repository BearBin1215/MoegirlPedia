import Snake from '../index';

export default class extends Snake {
    /**
     * 日志元素的jQuery对象
     */
    get $element() {
        return $(this.element);
    }

    /**
     * 标题的jQuery对象
     */
    get $head() {
        return $(this.head);
    }

    /**
     * 主体的jQuery对象
     */
    get $body() {
        return $(this.body);
    }
}