/**
 * @description 批量发送讨论页消息
 * @author BearBin
 * @todo 清理多余的异步代码
 * @todo 检查用户是否签名
 * 
 * <pre> 
 */

"use strict";
$(() => (async () => {
    await mw.loader.using(["mediawiki.api", "mediawiki.user", "mediawiki.util", "mediawiki.notification", "oojs-ui-core", "ext.gadget.site-lib"]);
    const api = new mw.Api;
    const $body = $("body");
    const isBot = mw.config.get("wgUserGroups").includes("flood"); // 用户是否拥有机器用户权限
    const GadgetTitle = wgULS("批量发送讨论页消息", "批量發送討論頁消息");
    const UserRights = await mw.user.getRights();
    const Noratelimit = UserRights.includes("noratelimit");

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

            this.checkRegBox = new OO.ui.CheckboxInputWidget({
                selected: true,
            });
            const checkRegField = new OO.ui.FieldLayout(this.checkRegBox, {
                label: wgULS("检查用户是否注册", "檢查使用者是否註冊"),
                align: "inline",
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
                placeholder: wgULS("（不会自动签名！）", "（不會自動簽名！）"),
                autosize: true,
            });
            const messageContentField = new OO.ui.FieldLayout(this.messageContentBox, {
                label: wgULS("要发送的内容", "要发送的內容"),
                align: "top",
            });

            this.panelLayout.$element.append(
                userListField.$element,
                checkRegField.$element,
                sectionTitleField.$element,
                messageContentField.$element,
            );
            if (!Noratelimit) {
                this.panelLayout.$element.prepend('<p style="font-size:1.143em"><b>提醒</b>：您未持有noratelimit权限，发送速率将受到限制，请耐心等待。</p>');
            }
            this.$body.append(this.panelLayout.$element);
        }

        get userList() {
            const list = this.userListBox.getValue().split("\n");
            return Array.from(new Set(list)); // 去重
        }
        get checkReg() {
            return this.checkRegBox.isSelected();
        }
        get sectionTitle() {
            return this.sectionTitleBox.getValue();
        }
        get messageContent() {
            return this.messageContentBox.getValue();
        }

        // 检查用户是否注册
        async userReg(user) {
            const d = await api.post({
                action: "query",
                list: "users",
                ususers: user.replaceAll(/\/.*/g, ""), // 去除子页面后缀
                usprop: "registration",
            });
            if (d.query.users[0].userid) {
                return true;
            }
            return false;
        }

        // 执行发送
        async send(user, title, message) {
            const d = await api.postWithToken("csrf", {
                format: "json",
                action: "edit",
                section: "new",
                watchlist: "nochange",
                tags: "Automation tool",
                bot: isBot,
                title: `User_talk:${user}`,
                sectiontitle: title,
                text: message,
            })
                .done(() => {
                    mw.notify(wgULS(`向用户${user}发送成功。`, `向使用者${user}發送成功。`));
                });
            if (d.error) {
                mw.notify(wgULS(`向${user}发送失败：${d.error.code}。`, `向${user}發送失敗：${d.error.code}。`));
                return false;
            }
            return true;
        }

        waitInterval(time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        }

        getActionProcess(action) {
            if (action === "cancel") {
                return new OO.ui.Process(() => {
                    this.close({ action });
                }, this);
            } else if (action === "submit") {
                return new OO.ui.Process($.when((async () => {
                    const title = this.sectionTitle;
                    const text = this.messageContent;
                    if (!title) {
                        throw new OO.ui.Error(wgULS("请输入提醒标题", "請輸入提醒標題"));
                    } else if (!text) {
                        throw new OO.ui.Error(wgULS("请输入要发送的文本", "請輸入要發送的文本"));
                    }
                    try {
                        const errorList = [];
                        for (const user of this.userList) {
                            // 检测用户是否勾选检查用户注册情况
                            if (this.checkReg) {
                                await this.userReg(user).then(async (result) => {
                                    if (result) {
                                        // 存在，发送
                                        await this.send(user, title, text)
                                            .then((result) => {
                                                if (!result) {
                                                    errorList.push(user); // 记录发送失败
                                                }
                                            });
                                        if (!Noratelimit) {
                                            await this.waitInterval(6000);
                                        }
                                    } else {
                                        mw.notify(wgULS(`用户${user.replaceAll(/\/.*/g, "")}未创建。`, `使用者${user.replaceAll(/\/.*/g, "")}未創建。`));
                                        errorList.push(user); // 记录发送失败
                                    }
                                });
                            } else {
                                await this.send(user, title, text)
                                    .then((result) => {
                                        if (!result) {
                                            errorList.push(user); // 记录发送失败
                                        }
                                    });
                            }
                        }
                        if (errorList.length > 0) {
                            oouiDialog.alert(errorList.join("、"), {
                                title: wgULS("向以下用户发送失败", "向以下使用者發送失敗"),
                                size: "small",
                            });
                        }
                        this.close({ action });
                    } catch (err) {
                        console.error("OOUI error:", err);
                        throw new OO.ui.Error(err);
                    }
                })()).promise(), this);
            }
            return super.getActionProcess(action);
        }
    }

    const windowManager = new OO.ui.WindowManager();
    $body.append(windowManager.$element);
    const MassSendDialog = new MassSendWindow({
        size: "large",
    });
    windowManager.addWindows([MassSendDialog]);

    $(mw.util.addPortletLink("p-cactions", "#", "群发提醒", "mass-send", GadgetTitle, "r")).on("click", (e) => {
        e.preventDefault();
        windowManager.openWindow(MassSendDialog);
        $body.css("overflow", "auto");
    });
})());