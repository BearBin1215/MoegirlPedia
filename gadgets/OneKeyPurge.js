/**
 * @description 批量零编辑
 * @warning 对大量被链入或嵌入的页面使用此工具将会向服务器发送相当大量的请求，慎用！
 * @todo 提供purge选项
 * @todo 根据noratelimit权限控制操作间隔（edit为10次/60s，purge为30次/60s）
 * @todo 指定从第几个页面开始/继续
 * 
 * @author BearBin
 * @contributor 鬼影233
 */
"use strict";
$(() => (async () => {
    if (mw.config.get("wgNamespaceNumber") !== -1) {
        await mw.loader.using(["mediawiki.api", "mediawiki.user", "mediawiki.notification", "oojs-ui"]);
        const api = new mw.Api();
        const PAGENAME = mw.config.get("wgPageName");
        const $body = $("body");
        const UserRights = await mw.user.getRights();
        const Noratelimit = UserRights.includes("noratelimit");

        class DEWindow extends OO.ui.ProcessDialog {
            failList = [];
            changeList = [];
            state = 0;
            static static = {
                ...super.static,
                tagName: "div",
                name: "lr-reminder",
                title: "批量零编辑",
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

                const noteText = Noratelimit ?
                    "<b>警告</b>：在被大量嵌入/链入的页面此工具将会向服务器发送<b>大量请求</b>，请慎重使用！"
                    :
                    "<b>提醒</b>：您未持有<code>noratelimit</code>权限，空编辑速率将被限制为<u>8次/min</u>，请耐心等待。<br>（其实这个功能压根没有做好，建议不要使用此工具刷新被大量嵌入或链入的页面）";
                this.panelLayout.$element.append(
                    this.panelLayout.$element.prepend($(`<div style="margin-bottom:.8em;font-size:1.143em;line-height:1.3">${noteText}</div>`)),
                    this.multiselectInput.$element,
                    $('<div style="margin:.8em 0 .5em;font-size:1.3em;text-align:center;text-decoration:underline">已完成<span id="okp-done">0</span>/<span id="okp-all">0</span>个页面</div>'),
                    $('<div id="okp-progress" style="display:flex;flex-wrap:wrap;justify-content:center;max-height:10.5em;overflow-y:auto;"></div>'),
                );
                this.$body.append(this.panelLayout.$element);
            }

            // 获取嵌入页面
            async getIncludeList() {
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
            }

            // 获取链入页面
            async getLinkList() {
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
            }

            // 根据用户选项获取页面列表
            async getList() {
                let PageList = [];
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
                PageList = [...new Set(PageList)];
                $("#okp-all").text(PageList.length);
                return PageList;
            }

            /**
             * 根据输入的标题和操作情况，更改显示进度的状态
             * @param title 页面标题
             * @param result 操作结果（success/warn/fail，大小写不敏感）
             * @param err 错误/警告消息
             */
            progressChange(title, result, err = "") {
                switch (result.toLowerCase()) {
                    case "success":
                        this.state++;
                        mw.notify(`页面【${title}】空编辑成功。`, { type: "success" });
                        $("#okp-done").text(this.state);
                        document.getElementById(`okp-progress-${title}`).style.backgroundColor = "#D5FDF4";
                        document.getElementById(`okp-progress-${title}`).style.borderColor = "#14866D";
                        break;
                    case "warn":
                        this.state++;
                        this.changeList.push(title);
                        $("#okp-done").text(this.state);
                        document.getElementById(`okp-progress-${title}`).style.backgroundColor = "#FEE7E6";
                        document.getElementById(`okp-progress-${title}`).style.borderColor = "#D33";
                        break;
                    case "fail":
                        this.failList.push(title);
                        mw.notify(`页面【${title}】空编辑失败${err ? `：${err}` : ""}。`, { type: "warn" });
                        document.getElementById(`okp-progress-${title}`).style.backgroundColor = "#FEF6E7";
                        document.getElementById(`okp-progress-${title}`).style.borderColor = "#EDAB00";
                        break;
                }
            }

            // 零编辑
            async nullEdit(title) {
                try {
                    await api.postWithToken("csrf", {
                        format: "json",
                        action: "edit",
                        appendtext: "",
                        watchlist: "nochange",
                        nocreate: true,
                        title,
                    }).done((data) => {
                        document.getElementById(`okp-progress-${title}`).scrollIntoView();
                        if (data.edit.result === "Success") {
                            this.state++;
                            $("#okp-done").text(this.state);
                            if (data.edit.nochange === "") {
                                mw.notify(`页面【${title}】零编辑成功。`, { type: "success" });
                                document.getElementById(`okp-progress-${title}`).style.backgroundColor = "#D5FDF4";
                                document.getElementById(`okp-progress-${title}`).style.borderColor = "#14866D";
                            } else {
                                this.changeList.push(title);
                                document.getElementById(`okp-progress-${title}`).style.backgroundColor = "#FEE7E6";
                                document.getElementById(`okp-progress-${title}`).style.borderColor = "#D33";
                            }
                        } else {
                            mw.notify(`页面【${title}】零编辑失败。`, { type: "warn" });
                            this.failList.push(title);
                            document.getElementById(`okp-progress-${title}`).style.backgroundColor = "#FEF6E7";
                            document.getElementById(`okp-progress-${title}`).style.borderColor = "#EDAB00";
                        }
                    });
                } catch (e) {
                    mw.notify(`页面【${title}】零编辑失败：${e}。`, { type: "warn" });
                    this.failList.push(title);
                    document.getElementById(`okp-progress-${title}`).style.backgroundColor = "#FEF6E7";
                    document.getElementById(`okp-progress-${title}`).style.borderColor = "#EDAB00";
                }
            }

            // 清除缓存
            async purge(title) {
                try {
                    await api.post({
                        format: "json",
                        action: "purge",
                        titles: title,
                        forcelinkupdate: true,
                    }).done(() => {
                        this.state++;
                        mw.notify(`清除页面【${title}】缓存成功。`, { type: "success" });
                    });
                } catch (e) {
                    mw.notify(`清除页面【${title}】缓存失败：${e}。`, { type: "warn" });
                    this.failList.push(title);
                }
            }

            getActionProcess(action) {
                if (action === "cancel") {
                    return new OO.ui.Process(() => {
                        this.close({ action });
                    }, this);
                } else if (action === "submit") {
                    return new OO.ui.Process($.when((async () => {
                        this.failList = [];
                        this.changeList = [];
                        this.state = 0;
                        $("#okp-done").text(0);
                        // 获取页面列表
                        await this.getList().then(async (result) => {
                            console.log(result);
                            if (result.length > 0) {
                                mw.notify(`共${result.length}个页面，开始执行零编辑……`);
                            }
                            document.getElementById("okp-progress").innerHTML = "";
                            const progressInner = document.createElement("div");
                            progressInner.style.width = "1em";
                            progressInner.style.aspectRatio = 1;
                            progressInner.style.backgroundColor = "#EAECF0";
                            progressInner.style.border = "1px solid";
                            progressInner.style.borderColor = "#A2A9B1";
                            progressInner.style.margin = ".2em";
                            for (const item of result) {
                                const _progressInner = progressInner.cloneNode();
                                _progressInner.id = `okp-progress-${item}`;
                                _progressInner.title = item;
                                document.getElementById("okp-progress").appendChild(_progressInner);
                            }
                            this.updateSize();
                            for (const item of result) {
                                await this.nullEdit(item);
                            }
                        }).then(() => {
                            // this.close({ action });
                            if (this.failList.length > 0) {
                                oouiDialog.alert(`${this.failList.join("、")}。<br>可能页面受到保护，或编辑被过滤器拦截，请手动检查。`, {
                                    title: "以下页面零编辑失败",
                                    size: "medium",
                                });
                            }
                            if (this.changeList.length > 0) {
                                oouiDialog.alert(`${this.changeList.join("、")}。<br>被意外更改，请手动撤回或回退`, {
                                    title: "以下页面被意外更改",
                                    size: "medium",
                                });
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
        const DEDialog = new DEWindow({
            size: "large",
        });
        windowManager.addWindows([DEDialog]);

        $(mw.util.addPortletLink("p-cactions", "#", "批量零编辑", "mass-null-edit")).on("click", () => {
            windowManager.openWindow(DEDialog);
            $body.css("overflow", "auto");
        });
    }
})());
