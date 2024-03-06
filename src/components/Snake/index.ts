/**
 * @author BearBin, 鬼影233
 */
import './index.less';

export interface SnakeProps {
  /**
   * 决定对象是否有head
   */
  hasHead: boolean;

  /**
   * 决定对象的项目是否有链接
   */
  hasHref: boolean;

  /**
   * Snake对象标签的属性值
   */
  [key: string]: string | boolean;
}

export default class Snake {
  private _length = 0; // 项目数
  private _complete = 0; // 已完成项目数

  /**
   * 是否有head
   */
  hasHead: boolean;

  /**
   * 是否有链接
   */
  hasHref: boolean;

  /**
   * 对象对应的HTML元素
   */
  element: HTMLElement;

  head: HTMLElement | undefined;

  body: HTMLElement;

  headComplete: HTMLElement | undefined;

  headLength: HTMLElement | undefined;

  /**
   * scale项目集合
   */
  blocks: Record<string, HTMLAnchorElement | HTMLDivElement> = {};

  /**
   * 创建一个Snake对象
   * @param token 输入参数组成的对象
   */
  constructor({ hasHead = true, hasHref = true, ...props }: SnakeProps) {
    // 给类的属性赋值
    this.hasHead = hasHead;
    this.hasHref = hasHref;

    /**
     * 根据html字符串创建节点
     * @param html
     * @returns 节点
     */
    const createTag = (html: string) => {
      const template = document.createElement('template');
      template.innerHTML = html.trim();
      return template.content.children[0] as HTMLElement;
    };

    // 创建element，并加上.snake
    this.element = createTag('<div class="snake"></div>');
    for (const key in props) {
      this.element.setAttribute(key, props[key] as string);
    }

    // 根据hasHead判断是否创建head
    if (this.hasHead) {
      this.head = createTag('<div class="snake-head"></div>');

      // head中的状态显示
      this.headComplete = createTag('<span class="snake-head-complete">0</div>');
      this.headLength = createTag('<span class="snake-head-all">0</div>');
      this.head.append('已完成：', this.headComplete, '/', this.headLength);

      // 添加到element
      this.element.append(this.head);
    }

    // 创建body
    this.body = createTag('<div class="snake-body"></div>');
    this.element.append(this.body);
  }

  /**
    * 设置length和complete时同步更改head元素
    */
  set length(val) {
    this._length = val;
    if (this.hasHead) {
      this.headLength!.innerHTML = (val as unknown) as string;
    }
  }
  get length() {
    return this._length;
  }

  set complete(val) {
    this._complete = val;
    if (this.hasHead) {
      this.headComplete!.innerHTML = (val as unknown) as string;
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
  addScale(name: string, title: string, href: string) {
    if (this.blocks[name]) {
      throw new Error(`Snake: 项目${name}已存在。`);
    }
    let scaleNode;

    // 根据hasHref判断创建<a>或<div>
    if (this.hasHref) {
      scaleNode = document.createElement('a');
      scaleNode.title = title || name;
      scaleNode.href = href || `/${name}`;
      scaleNode.target = '_blank';
    } else {
      scaleNode = document.createElement('div');
      if (title) {
        scaleNode.title = title;
      }
    }
    scaleNode.classList.add('snake-scale', 'scale-state-ready');
    scaleNode.dataset.scaleState = 'ready'; // 记录项目状态

    // 加入blocks列表，并添加到body中显示
    this.length++;
    this.blocks[name] = scaleNode;
    this.body.append(scaleNode);
  }

  /**
   * 移除项目
   * @param ...name 要移除项目的名称
   */
  removeScale(...name: string[]) {
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
   * @param name 项目的名称
   * @param state 目标状态，可以是ready/ongoing/warn/success/fail之一，默认为success
   */
  crawl(name: string, state = 'success') {
    if (!this.blocks[name]) {
      throw new Error(`Snake: 不存在名为${name}的项目。`);
    }

    // 根据当前状态和目标状态调整complete并设置data-scale-state值
    if (this.blocks[name].dataset.scaleState === 'success') {
      this.complete--;
    }
    if (state === 'success') {
      this.complete++;
    }
    if (this.blocks[name].dataset.scaleState === 'ongoing') {
      this.blocks[name].classList.remove('oo-ui-pendingElement-pending');
    }
    if (state === 'ongoing') {
      this.blocks[name].classList.add('oo-ui-pendingElement-pending');
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
    this.body.innerHTML = '';
  }
}
