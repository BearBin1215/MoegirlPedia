/**
 * @description 批量刷新缓存
 * @todo 指定从第几个页面开始/继续
 * 
 * @author BearBin
 * @contributor 鬼影233
 */

// eslint-disable-next-line
var _addText = '{{Documentation|content=本小工具用于快速清理嵌入/链入到某个页面的所有页面。\n\n使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码\n<pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("/index.php?title=User:BearBin/js/OneKeyPurge.js&action=raw&ctype=text/javascript");</pre>\n如果您有好的建议，欢迎前往[[User_talk:BearBin|我的讨论页]]，或在GitHub上[https://github.com/BearBin1215/MoegirlPedia/issues 提交issue]。\n*作者：[[User:BearBin|BearBin]]、[[User:鬼影233|鬼影233]]}}';

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

                this.typeSelectInput = new OO.ui.CheckboxMultiselectInputWidget({
                    options: [
                        { data: "link", label: "链接" },
                        { data: "include", label: "嵌入" },
                    ],
                });
                const typeFiled = new OO.ui.FieldLayout(this.typeSelectInput, {
                    label: "页面类型",
                });

                this.optionRadioSelect = new OO.ui.RadioSelectWidget({
                    items: [
                        new OO.ui.RadioOptionWidget({ data: "purge", label: "清除缓存（Purge）", selected: true }),
                        new OO.ui.RadioOptionWidget({ data: "nulledit", label: "零编辑（Null Edit）", selected: false }),
                    ],
                });
                const optionFiled = new OO.ui.FieldLayout(this.optionRadioSelect, {
                    label: "操作类型",
                });

                const noteText = Noratelimit ?
                    "<b>警告</b>：在被大量嵌入/链入的页面此工具将会向服务器发送<b>大量请求</b>，请慎重使用！"
                    :
                    "<b>提醒</b>：您未持有<code>noratelimit</code>权限，清除缓存和零编辑的速率将被分别限制为<u>30次/min</u>和<u>10次/min</u>，请耐心等待。";
                this.panelLayout.$element.append(
                    $(`<div style="margin-bottom:.8em;font-size:1.143em;line-height:1.3">${noteText}</div>`),
                    typeFiled.$element,
                    optionFiled.$element,
                    $('<div style="margin:.8em 0 .5em;font-size:1.3em;text-align:center;text-decoration:underline">已完成<span id="okp-done">0</span>/<span id="okp-all">0</span>个页面</div>'),
                    $('<div id="okp-progress" style="display:flex;flex-wrap:wrap;justify-content:center;max-height:10.5em;overflow-y:auto;"></div>'),
                );
                this.$body.append(this.panelLayout.$element);
                $("#one-key-purge .oo-ui-fieldLayout-header").css("font-weight", "bold").css("width", "20%").css("min-width", "6em");
                $("#one-key-purge .oo-ui-multiselectWidget-group, #one-key-purge .oo-ui-radioSelectWidget").css("display", "flex").css("flex-wrap", "wrap");
                $("#one-key-purge .oo-ui-multiselectWidget-group>label, #one-key-purge .oo-ui-radioSelectWidget>label").css("flex", "1 0 11em").css("padding", "4px 0");
            }

            waitInterval(time) {
                return new Promise((resolve) => setTimeout(resolve, time));
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
                $("#okp-all").text(PageList.length);
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
                switch (result.toLowerCase()) {
                    case "success": // 成功且无意外
                        this.state++;
                        mw.notify(`页面【${title}】${optionText}成功。`, { type: "success" });
                        $("#okp-done").text(this.state);
                        document.getElementById(`okp-progress-${title}`).style.backgroundColor = "#D5FDF4";
                        document.getElementById(`okp-progress-${title}`).style.borderColor = "#14866D";
                        break;
                    case "warn": // 成功但出现意外，目前仅用于编辑产生意外的源代码变动
                        this.state++;
                        this.changeList.push(title);
                        $("#okp-done").text(this.state);
                        document.getElementById(`okp-progress-${title}`).style.backgroundColor = "#FEE7E6";
                        document.getElementById(`okp-progress-${title}`).style.borderColor = "#D33";
                        break;
                    case "fail": // 失败
                        this.failList.push(title);
                        mw.notify(`页面【${title}】${optionText}失败${err ? `：${err}` : ""}。`, { type: "warn" });
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
                            $("#okp-done").text(this.state);
                            if (data.edit.nochange === "") {
                                this.progressChange(title, "success");
                            } else {
                                this.progressChange(title, "warn");
                            }
                        } else {
                            this.progressChange(title, "fail");
                        }
                    });
                } catch (e) {
                    this.progressChange(title, "fail", e);
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
                        this.progressChange(title, "success");
                    });
                } catch (e) {
                    this.progressChange(title, "fail", e);
                }
            }

            getActionProcess(action) {
                if (action === "cancel") {
                    return new OO.ui.Process(() => {
                        this.close({ action });
                    }, this);
                } else if (action === "submit") {
                    return new OO.ui.Process($.when((async () => {
                        if (!this.optionType) {
                            mw.notify("请选择一种操作类型");
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
                            // 进度条初始化
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
                            if (this.optionType === "nulledit") {
                                for (const item of result) {
                                    await this.nullEdit(item);
                                    if (!Noratelimit) {
                                        await this.waitInterval(6000);
                                    }
                                }
                            } else {
                                for (const item of result) {
                                    await this.purge(item);
                                    if (!Noratelimit) {
                                        await this.waitInterval(2000);
                                    }
                                }
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

        $(mw.util.addPortletLink("p-cactions", "#", "批量清除缓存", "ca-purge")).on("click", () => {
            windowManager.openWindow(DEDialog);
            $body.css("overflow", "auto");
        });
    }
})());
