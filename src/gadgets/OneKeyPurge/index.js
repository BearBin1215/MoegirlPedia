import Snake from '../../components/Snake';

$(() => (async () => {
    if (mw.config.get("wgNamespaceNumber") === -1) {
        return;
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
                $(this.progressBar.element),
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