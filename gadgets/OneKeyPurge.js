/**
 * @description 批量刷新缓存
 * @todo 指定从第几个页面开始/继续
 * 
 * @author BearBin
 * @contributor 鬼影233
 */

// eslint-disable-next-line
var _addText = '{{Documentation|content=本小工具用于快速清理嵌入/链入到某个页面的所有页面。\n\n使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码\n<pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("/index.php?title=User:BearBin/js/OneKeyPurge.js&action=raw&ctype=text/javascript");</pre>\n如果您有好的建议，欢迎前往[[User_talk:BearBin|我的讨论页]]，或在GitHub上[https://github.com/BearBin1215/MoegirlPedia/issues 提交issue]。\n*作者：[[User:BearBin|BearBin]]、[[User:鬼影233|鬼影233]]}}';

// <pre>
"use strict";
$(() => (async () => {
    if (mw.config.get("wgNamespaceNumber") === -1) {
        return;
    }
    mw.loader.addStyleTag(`
    .snake-head {
        margin: .8em 0 .5em;
        font-size: 1.3em;
        text-align: center;
        text-decoration: underline;
    }
    
    .snake-body {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: .2em;
        max-height: 10.5em;
        overflow-y: auto;
    }
    
    .snake-scale {
        width: 1em;
        height: 1em;
        border: 1px solid;
    }
    
    [data-scale-state="ready"], [data-scale-state="ongoing"] {
        background-color: #EAECF0;
        border-color: #A2A9B1;
    }
    
    [data-scale-state="success"] {
        background-color: #D5FDF4;
        border-color: #16876E;
    }
    
    [data-scale-state="warn"] {
        background-color: #FEE7E6;
        border-color: #D33;
    }
    
    [data-scale-state="fail"] {
        background-color: #FEF6E7;
        border-color: #EDAB00;
    }
    `);

    /**
     * 进度条类
     * @link https://github.com/BearBin1215/WikiWidgets#snake
     */
    class Snake {
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
        addScale = (name, title, href) => {
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
        };

        /**
         * 更改项目状态
         * @param {string} name 项目的名称
         * @param {string} state 目标状态，可以是ready/ongoing/warn/success/fail之一，默认为complete
         */
        crawl = (name, state = "success") => {
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
        };

        /**
         * 清空项目
         */
        clear = () => {
            this.complete = 0;
            this.length = 0;
            this.blocks = {};
            this.body.innerHTML = "";
        };
    }
    await mw.loader.using(["mediawiki.api", "mediawiki.user", "mediawiki.notification", "oojs-ui"]);
    const api = new mw.Api();
    const PAGENAME = mw.config.get("wgPageName");
    const $body = $("body");
    const UserRights = await mw.user.getRights();
    const Noratelimit = UserRights.includes("noratelimit");

    class OKPWindow extends OO.ui.ProcessDialog {
        failList = []; // 记录操作失败的页面
        changeList = []; // 记录代码产生意外变化的页面
        state = 0; // 已完成操作的页面数，成功或发生变化，不含失败
        static static = {
            ...super.static,
            tagName: "div",
            name: "one-key-purge",
            title: "批量清除页面缓存",
            actions: [
                {
                    action: "cancel",
                    label: "取消",
                    flags: ["safe", "close", "destructive"],
                },
                {
                    action: "submit",
                    label: "执行",
                    flags: ["primary", "progressive"],
                },
                {
                    action: "help",
                    icon: "help",
                    label: "帮助",
                },
            ],
        };

        /**
         * 构造函数
         * @param {Object} config 
         */
        constructor(config) {
            super(config);
        }
        initialize() {
            super.initialize();
            this.panelLayout = new OO.ui.PanelLayout({
                scrollable: false,
                expanded: false,
                padded: true,
                id: "one-key-purge",
            });

            // 选择要获取的页面类型，可都选
            this.typeSelectInput = new OO.ui.CheckboxMultiselectInputWidget({
                options: [
                    { data: "link", label: "链接" },
                    { data: "include", label: "嵌入" },
                ],
            });
            const typeFiled = new OO.ui.FieldLayout(this.typeSelectInput, {
                label: "页面类型",
            });

            // 选择要进行的操作，单选
            const purgeOption = new OO.ui.RadioOptionWidget({ data: "purge", label: "清除缓存（Purge）" });
            const nullEditOption = new OO.ui.RadioOptionWidget({ data: "nulledit", label: "零编辑（Null Edit）" });
            this.optionRadioSelect = new OO.ui.RadioSelectWidget({
                items: [
                    purgeOption,
                    nullEditOption,
                ],
            });
            this.optionRadioSelect.selectItem(purgeOption);
            const optionFiled = new OO.ui.FieldLayout(this.optionRadioSelect, {
                label: "操作类型",
            });

            const noteText = Noratelimit ?
                "<b>警告</b>：在被大量嵌入/链入的页面此工具将会向服务器发送<b>大量请求</b>，请慎重使用！"
                :
                "<b>提醒</b>：您未持有<code>noratelimit</code>权限，清除缓存和零编辑的速率将被分别限制为<u>30次/min</u>和<u>10次/min</u>，请耐心等待。";

            this.progressBar = new Snake();
            this.panelLayout.$element.append(
                $(`<div style="margin-bottom:.8em;font-size:1.143em;line-height:1.3">${noteText}</div>`),
                typeFiled.$element,
                optionFiled.$element,
                this.progressBar.$element,
            );
            this.$body.append(this.panelLayout.$element);
            $("#one-key-purge .oo-ui-fieldLayout-header").css("font-weight", "bold").css("width", "20%").css("min-width", "6em");
            $("#one-key-purge .oo-ui-multiselectWidget-group, #one-key-purge .oo-ui-radioSelectWidget").css("display", "flex").css("flex-wrap", "wrap");
            $("#one-key-purge .oo-ui-multiselectWidget-group>label, #one-key-purge .oo-ui-radioSelectWidget>label").css("flex", "1 0 11em").css("padding", "4px 0");
        }

        /**
         * 等待一段时间，用于模拟sleep
         * @param {number} time 等待间隔，单位ms
         * @returns 
         */
        waitInterval = (time) => new Promise((resolve) => setTimeout(resolve, time));

        // 获取嵌入页面
        getIncludeList = async () => {
            let ticontinue = 1;
            const pageList = [];
            while (ticontinue) {
                const includeList = await api.get({
                    action: "query",
                    prop: "transcludedin",
                    titles: PAGENAME,
                    tilimit: "max",
                    ticontinue,
                });
                if (Object.values(includeList.query.pages)[0].transcludedin) {
                    for (const item of Object.values(includeList.query.pages)[0].transcludedin) {
                        console.log(`查找到嵌入【${PAGENAME}】的页面：${item.title}`);
                        pageList.push(item.title);
                    }
                }
                ticontinue = includeList.continue ? includeList.continue.ticontinue : false;
            }
            if (pageList.length > 0) {
                mw.notify(`获取嵌入【${PAGENAME}】的页面列表成功。`);
            } else {
                mw.notify(`没有页面嵌入了【${PAGENAME}】。`);
            }
            return pageList;
        };

        // 获取链入页面
        getLinkList = async () => {
            let lhcontinue = 1;
            const pageList = [];
            while (lhcontinue) {
                const linkList = await api.get({
                    action: "query",
                    prop: "linkshere",
                    titles: PAGENAME,
                    lhlimit: "max",
                    lhcontinue,
                });
                if (Object.values(linkList.query.pages)[0].linkshere) {
                    for (const item of Object.values(linkList.query.pages)[0].linkshere) {
                        console.log(`查找到链接到【${PAGENAME}】的页面：${item.title}`);
                        pageList.push(item.title);
                    }
                }
                lhcontinue = linkList.continue ? linkList.continue.lhcontinue : false;
            }
            if (pageList.length > 0) {
                mw.notify(`获取链接到【${PAGENAME}】的页面列表成功。`);
            } else {
                mw.notify(`没有页面链接到【${PAGENAME}】。`);
            }
            return pageList;
        };

        // 根据用户选项获取页面列表
        async getList() {
            let PageList = [];
            if (this.typeSelectInput.getValue().includes("link")) {
                await this.getLinkList().then((result) => {
                    PageList.push(...result);
                });
            }
            if (this.typeSelectInput.getValue().includes("include")) {
                await this.getIncludeList().then((result) => {
                    PageList.push(...result);
                });
            }
            PageList = [...new Set(PageList)];
            return PageList;
        }

        // 返回用户所选择的操作
        get optionType() {
            return this.optionRadioSelect.findSelectedItem()?.getData();
        }

        /**
         * 根据输入的标题和操作情况，更改进度条样式来显示进度
         * @param title 页面标题
         * @param result 操作结果（success/warn/fail，大小写不敏感）
         * @param err （可选）错误/警告消息
         */
        progressChange(title, result, err = "") {
            const optionText = this.optionType === "nulledit" ? "零编辑" : "清除缓存";
            this.progressBar.crawl(title, result);
            switch (result.toLowerCase()) {
                case "success": // 成功且无意外
                    this.state++;
                    mw.notify(`页面【${title}】${optionText}成功。`, { type: "success" });
                    break;
                case "warn": // 成功但出现意外，目前仅用于编辑产生意外的源代码变动
                    this.state++;
                    this.changeList.push(title);
                    break;
                case "fail": // 失败
                    this.failList.push(title);
                    mw.notify(`页面【${title}】${optionText}失败${err ? `：${err}` : ""}。`, { type: "warn" });
                    break;
            }
        }

        // 零编辑
        async nullEdit(titles) {
            for (const title of titles) {
                this.progressBar.crawl(title, "ongoing");
                api.postWithToken("csrf", {
                    format: "json",
                    action: "edit",
                    appendtext: "",
                    watchlist: "nochange",
                    nocreate: true,
                    title,
                }).done((data) => {
                    this.progressBar.crawl(title, "ongoing");
                    if (data.edit.result === "Success") {
                        if (data.edit.nochange !== undefined) {
                            this.progressChange(title, "success");
                        } else {
                            this.progressChange(title, "warn");
                        }
                    } else {
                        this.progressChange(title, "fail");
                    }
                }).catch((error) => {
                    this.progressChange(title, "fail", error);
                });
                if (!Noratelimit) {
                    await this.waitInterval(6000);
                } else {
                    await this.waitInterval(1000);
                }
            }
        }

        /**
         * 清除缓存（action=purge）
         * @param {string[]} pageList 页面列表
         */
        async purge(pageList) {
            // 分割为5个一批，执行purge
            for (let i = 0; i < pageList.length; i += 5) {
                const pages = pageList.slice(i, i + 5);
                // 将准备发送请求的页面标记为进行
                for (const title of pages) {
                    this.progressBar.crawl(title, "ongoing");
                }
                // document.getElementById(`okp-progress-${pages[pages.length - 1]}`).scrollIntoView();
                api.post({
                    format: "json",
                    action: "purge",
                    titles: pages.join("|"),
                    forcelinkupdate: true,
                }).done((response) => {
                    // 将成功purge的页面标记为完成。其余标记为失败？
                    for (const page of response.purge) {
                        this.progressChange(page.title, "success");
                    }
                }).catch((error) => {
                    for (const title of pages) {
                        this.progressChange(title, "fail", error);
                    }
                });
                // 如果不是最后一批，根据是否拥有noratelimit权限等待间隔
                if (i + 50 < pageList.length) {
                    if (!Noratelimit) {
                        await this.waitInterval(2000);
                    } else {
                        await this.waitInterval(1000);
                    }
                }
            }
        }

        getActionProcess(action) {
            if (action === "cancel") {
                return new OO.ui.Process(() => {
                    this.close({ action });
                }, this);
            } else if (action === "help") {
                const helpText = $('<ul style="list-style:circle;padding-left:1.2em"></ul>');
                helpText.append(
                    "<li><b>清除缓存</b>：通常在需要刷新页面内容时使用，例如模板编辑后刷新嵌入了此模板的页面。</li>",
                    `<li><b>零编辑</b>：通常在需要刷新<a href="/Special:链入页面/${PAGENAME}">链入/嵌入页面列表</a>时使用，例如页面移动后清理链入。</li>`,
                );
                OO.ui.alert(helpText, {
                    title: "帮助",
                    size: "medium",
                });
            } else if (action === "submit") {
                return new OO.ui.Process($.when((async () => {
                    this.progressBar.clear();
                    if (this.typeSelectInput.getValue().length === 0) {
                        mw.notify("请选择页面类型。");
                    }
                    this.failList = [];
                    this.changeList = [];
                    this.state = 0;
                    $("#okp-done").text(0);
                    // 获取页面列表
                    await this.getList().then(async (result) => {
                        console.log(result);
                        if (result.length > 0) {
                            mw.notify(`共${result.length}个页面，开始执行${this.optionType === "nulledit" ? "零编辑" : "清除缓存"}……`);
                        }
                        for (const item of result) {
                            this.progressBar.addScale(item);
                        }
                        this.updateSize();
                        if (this.optionType === "nulledit") {
                            await this.nullEdit(result);
                        } else {
                            await this.purge(result);
                        }
                    }).then(() => {
                        // this.close({ action });
                        if (this.failList.length > 0) {
                            throw new OO.ui.Error($(`<div>${this.failList.join("、")}<br>可能页面受到保护，或编辑被过滤器拦截，请手动检查。</div>`));
                        }
                        if (this.changeList.length > 0) {
                            throw new OO.ui.Error($(`<div>${this.changeList.join("、")}。<br>被意外更改，请手动撤回或回退`));
                        }
                    });
                })()).promise(), this);
            }
            return super.getActionProcess(action);
        }
    }

    const windowManager = new OO.ui.WindowManager({
        id: "one-key-purge",
    });
    $body.append(windowManager.$element);
    const OKPDialog = new OKPWindow({
        size: "large",
    });
    windowManager.addWindows([OKPDialog]);

    $(mw.util.addPortletLink("p-cactions", "javascript:void(0)", "批量清除缓存", "ca-okp")).on("click", () => {
        $("#mw-notification-area").appendTo("body"); // 使提醒在窗口上层
        windowManager.openWindow(OKPDialog);
        $body.css("overflow", "auto");
    });
})());

// </pre>