/**
 * @author BearBin, 鬼影233
 */
import "./index.less";

export default class Snake {
    _length = 0; // 项目数
    _complete = 0; // 已完成项目数
    blocks = {}; // 项目集合

    /**
     * 创建一个Snake对象
     * @param {object} token 输入参数组成的对象。token.hasHead决定对象是否有head，token.hasHref决定对象的项目是否有链接，其他对象则成为Snake对象标签的属性值。
     */
    constructor(token = {}) {
        // 给类的属性赋值
        this.hasHead = token.hasHead !== false;
        this.hasHref = token.hasHref !== false;
        Reflect.deleteProperty(token, "hasHead");
        Reflect.deleteProperty(token, "hasHref");

        // 创建element，并加上.snake
        this.element = document.createElement("div");
        for (const key in token) {
            this.element.setAttribute(key, token[key]);
        }
        this.element.classList.add("snake");

        // 根据hasHead判断是否创建head
        if (this.hasHead) {
            this.head = document.createElement("div");
            this.head.classList.add("snake-head");

            // head中的状态显示
            this.head.complete = document.createElement("span");
            this.head.complete.classList.add("snake-head-complete");
            this.head.complete.innerHTML = 0;
            this.head.length = document.createElement("span");
            this.head.length.classList.add("snake-head-all");
            this.head.length.innerHTML = 0;
            this.head.append("已完成：", this.head.complete, "/", this.head.length);

            // 添加到element
            this.element.append(this.head);
        }

        // 创建body
        this.body = document.createElement("div");
        this.body.classList.add("snake-body");
        this.element.append(this.body);
    }

    /**
     * 对象的HTML元素
     */
    get $element() {
        return $(this.element);
    }
    get $head() {
        return $(this.head);
    }
    get $body() {
        return $(this.body);
    }

    /**
     * 设置length和complete时同步更改head元素
     */
    set length(val) {
        this._length = val;
        if (this.hasHead) {
            this.head.length.innerHTML = val;
        }
    }
    get length() {
        return this._length;
    }

    set complete(val) {
        this._complete = val;
        if (this.hasHead) {
            this.head.complete.innerHTML = val;
        }
    }
    get complete() {
        return this._complete;
    }

    /**
     * 添加一个项目
     * @param {string} name 项目的名称，在本对象中应当独一无二
     * @param {string} title 项目元素的title属性；若留空，hasHref为true时会从name继承，为false时不会继承
     * @param {string} href 项目元素的href属性，仅在hasHref为true时有效；若留空则会从name继承
     */
    addScale(name, title, href) {
        if (this.blocks[name]) {
            throw new Error(`Snake: 项目${name}已存在。`);
        }
        let scaleNode;

        // 根据hasHref判断创建<a>或<div>
        if (this.hasHref) {
            scaleNode = document.createElement("a");
            scaleNode.title = title || name;
            scaleNode.href = href || `/${name}`;
            scaleNode.target = "_blank";
        } else {
            scaleNode = document.createElement("div");
            if (title) {
                scaleNode.title = title;
            }
        }
        scaleNode.classList.add("snake-scale", "scale-state-ready");
        scaleNode.dataset.scaleState = "ready"; // 记录项目状态

        // 加入blocks列表，并添加到body中显示
        this.length++;
        this.blocks[name] = scaleNode;
        this.body.append(scaleNode);
    }

    /**
     * 移除一个项目
     * @param {string[]} ...name 要移除项目的名称
     */
    removeScale(...name) {
        // 根据name的类型判断是一个或多个
        for (const item of name) {
            if (!this.blocks[item]) {
                throw new Error(`Snake: 不存在名为${name}的项目。`);
            }
            this.blocks[item].remove();
            this.length--;
            Reflect.deleteProperty(this.blocks, item);
        }
    }

    /**
     * 更改项目状态
     * @param {string} name 项目的名称
     * @param {string} state 目标状态，可以是ready/ongoing/warn/success/fail之一，默认为success
     */
    crawl(name, state = "success") {
        if (!this.blocks[name]) {
            throw new Error(`Snake: 不存在名为${name}的项目。`);
        }

        // 根据当前状态和目标状态调整complete并设置data-scale-state值
        if (this.blocks[name].dataset.scaleState === "success") {
            this.complete--;
        }
        if (state === "success") {
            this.complete++;
        }
        if (this.blocks[name].dataset.scaleState === "ongoing") {
            this.blocks[name].classList.remove("oo-ui-pendingElement-pending");
        }
        if (state === "ongoing") {
            this.blocks[name].classList.add("oo-ui-pendingElement-pending");
        }
        this.blocks[name].dataset.scaleState = state;
        this.blocks[name].scrollIntoView();
    }

    /**
     * 清空项目
     */
    clear() {
        this.complete = 0;
        this.length = 0;
        this.blocks = {};
        this.body.innerHTML = "";
    }
}