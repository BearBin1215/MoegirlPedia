/**
 * @description 批量空编辑
 * @warning 对大量被链入或嵌入的页面使用此工具将会向服务器发送相当大量的请求，慎用！
 */
"use strict";
$(() => (async () => {
    await mw.loader.using(["mediawiki.api", "mediawiki.notification", "oojs-ui"]);
    const api = new mw.Api();
    const PAGENAME = mw.config.get("wgPageName");
    const $body = $("body");

    class DEWindow extends OO.ui.ProcessDialog {
        state = 0;
        static static = {
            ...super.static,
            tagName: "div",
            name: "lr-reminder",
            title: "批量空编辑",
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
            ],
        };
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

            this.multiselectInput = new OO.ui.CheckboxMultiselectInputWidget({
                options: [
                    { data: "link", label: "链接" },
                    { data: "include", label: "嵌入" },
                ],
            });
            this.multiselectInput.$element.find(".oo-ui-multiselectWidget-group").css("display", "flex").css("font-size", "1.2em");
            this.multiselectInput.$element.find("label").css("padding", "0").css("flex", "1 0");

            this.panelLayout.$element.append(
                $('<div style="margin-bottom:.8em;font-size:1.143em;line-height:1.3"><b style="color:red;">警告</b>：在被大量嵌入/链入的页面此工具将会向服务器发送<b>大量的请求</b>，请慎重使用！</div>'),
                this.multiselectInput.$element,
                $('<div style="margin-top:.8em;font-size:1.3em;text-align:center;text-decoration:underline">已完成<span id="okp-done">0</span>/<span id="okp-all">0</span>个页面</div>'),
            );
            this.$body.append(this.panelLayout.$element);
        }

        // 获取嵌入页面
        async getIncludeList() {
            let ticontinue = 1;
            const pageList = [];
            while (ticontinue) {
                const includeList = await api.post({
                    action: "query",
                    prop: "transcludedin",
                    titles: PAGENAME,
                    tilimit: 500,
                    ticontinue: ticontinue,
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
                mw.notify(`【${PAGENAME}】没有被任何页面嵌入。`);
            }
            return pageList;
        }

        // 获取链入页面
        async getLinkList() {
            let lhcontinue = 1;
            const pageList = [];
            while (lhcontinue) {
                const linkList = await api.post({
                    action: "query",
                    prop: "linkshere",
                    titles: PAGENAME,
                    lhlimit: 500,
                    lhcontinue: lhcontinue,
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
        }

        async getList() {
            const PageList = [];
            if (this.multiselectInput.getValue().includes("link")) {
                await this.getLinkList().then((result) => {
                    PageList.push(...result);
                });
            }
            if (this.multiselectInput.getValue().includes("include")) {
                await this.getIncludeList().then((result) => {
                    PageList.push(...result);
                });
            }
            $("#okp-all").text(PageList.length);
            return PageList;
        }

        // 空编辑操作
        async dummyEdit(title) {
            await api.postWithToken("csrf", {
                format: "json",
                action: "edit",
                appendtext: "",
                watchlist: "nochange",
                nocreate: true,
                title: title,
            }).done(() => {
                mw.notify(`页面【${title}】空编辑成功。`);
                this.state++;
                $("#okp-done").text(this.state);
            }).fail((err) => {
                mw.notify(`页面【${title}】空编辑失败：${err}。`);
            });
        }

        getActionProcess(action) {
            if (action === "cancel") {
                return new OO.ui.Process(() => {
                    this.close({ action });
                }, this);
            } else if (action === "submit") {
                return new OO.ui.Process($.when((async () => {
                    await this.getList().then(async (result) => {
                        console.log(result);
                        if(result.length > 0) {
                            mw.notify(`共${result.length}个页面，开始执行空编辑……`);
                        }
                        for (const item of result) {
                            await this.dummyEdit(item);
                        }
                    }).then(() => {
                        this.close({ action });
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
    const DEDialog = new DEWindow({
        size: "medium",
    });
    windowManager.addWindows([DEDialog]);

    $(mw.util.addPortletLink("p-cactions", "#", "批量空编辑", "dummy-edit")).on("click", () => {
        windowManager.openWindow(DEDialog);
        $body.css("overflow", "auto");
    });
})());