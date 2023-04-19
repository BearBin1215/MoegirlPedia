/**
 * <pre> 
 * 批量发送讨论页消息
 */

"use strict";

$(() => (async () => {
    await mw.loader.using(["mediawiki.api", "mediawiki.util", "mediawiki.notification", "oojs-ui-core", "ext.gadget.site-lib"]);
    const api = new mw.Api;
    const $body = $("body");
    const isBot = mw.config.get("wgUserGroups").includes("flood"); // 用户是否拥有机器用户权限
    const GadgetTitle = wgULS("批量发送讨论页消息", "批量發送討論頁消息");

    class MassSendWindow extends OO.ui.ProcessDialog {
        static static = {
            ...super.static,
            tagName: "div",
            name: "lr-masssned",
            title: GadgetTitle,
            actions: [
                {
                    action: "cancel",
                    label: "取消",
                    flags: ["safe", "close", "destructive"],
                },
                {
                    action: "submit",
                    label: wgULS("发送", "發送"),
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
            });

            this.userListBox = new OO.ui.MultilineTextInputWidget({
                validate: "non-empty",
                placeholder: "（使用换行分隔，一行一个）",
                autosize: true,
            });
            const userListField = new OO.ui.FieldLayout(this.userListBox, {
                label: wgULS("用户列表", "使用者列表"),
                align: "top",
            });

            this.sectionTitleBox = new OO.ui.TextInputWidget({
                validate: "non-empty",
                autosize: true,
            });
            const sectionTitleField = new OO.ui.FieldLayout(this.sectionTitleBox, {
                label: wgULS("提醒标题", "提醒標題"),
                align: "top",
            });

            this.messageContentBox = new OO.ui.MultilineTextInputWidget({
                validate: "non-empty",
                placeholder: wgULS("（不会自动签名）", "（不會自動簽名）"),
                autosize: true,
            });
            const messageContentField = new OO.ui.FieldLayout(this.messageContentBox, {
                label: wgULS("要发送的内容", "要发送的內容"),
                align: "top",
            });

            this.panelLayout.$element.append(
                userListField.$element,
                sectionTitleField.$element,
                messageContentField.$element,
            );
            this.$body.append(this.panelLayout.$element);
        }

        get userList() {
            const list = this.userListBox.getValue().split("\n");
            return Array.from(new Set(list)); // 去重
        }

        get sectionTitle() {
            return this.sectionTitleBox.getValue();
        }

        get messageContent() {
            return this.messageContentBox.getValue();
        }

        async send(user, title, message) {
            const d = await api.postWithToken("csrf", {
                format: "json",
                action: "edit",
                section: "new",
                watchlist: "nochange",
                tags: "Automation tool",
                bot: isBot ? true : false,
                title: `User_talk:${user}`,
                sectiontitle: title,
                text: message,
            })
                .done(() => {
                    mw.notify(wgULS(`向用户${user}发送成功。`, `向使用者${user}發送成功。`));
                    return true;
                });
            if (d.error) {
                mw.notify(wgULS(`向${user}发送失败：${d.error.code}。`, `向${user}發送失敗：${d.error.code}。`));
                return false;
            }
        }

        getActionProcess(action) {
            if (action === "cancel") {
                return new OO.ui.Process(() => {
                    this.close({ action });
                }, this);
            } else if (action === "submit") {
                const title = this.sectionTitle;
                const text = this.messageContent;
                return new OO.ui.Process($.when((async () => {
                    try {
                        const errorList = [];
                        for (const user of this.userList) {
                            const d = await this.send(user, title, text);
                            if (d) {
                                errorList.push(user); // 记录发送失败
                            }
                        }
                        if (errorList.length > 0) {
                            oouiDialog.alert(errorList.join("、"), {
                                title: wgULS("向以下用户发送失败", "向以下使用者發送失敗"),
                                size: "small",
                            });
                        }
                        this.close({ action });
                    } catch (e) {
                        console.error("OOUI error:", e);
                        throw new OO.ui.Error(e);
                    }

                })()).promise(), this);
            }
            return super.getActionProcess(action);
        }
    }

    const windowManager = new OO.ui.WindowManager();
    $body.append(windowManager.$element);
    const MassSendDialog = new MassSendWindow({
        size: "larger",
    });
    windowManager.addWindows([MassSendDialog]);

    $(mw.util.addPortletLink("p-cactions", "#", "批发提醒", "mass-send", GadgetTitle, "r")).on("click", (e) => {
        e.preventDefault();
        windowManager.openWindow(MassSendDialog);
        $body.css("overflow", "auto");
    });
})());