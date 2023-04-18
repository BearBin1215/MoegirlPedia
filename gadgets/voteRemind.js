/**
 * <pre>
 * @todo 支持人事案
 * @todo 排除已投票
 * 
 * @rights edit
 * @dependencies mediawiki.api, mediawiki.util, ext.gadget.libOOUIDialog, mediawiki.notify, ext.gadget.site-lib
 */

"use strict";
mw.loader.using(["mediawiki.api", "mediawiki.util", "ext.gadget.libOOUIDialog", "mediawiki.notify", "ext.gadget.site-lib"], function () {
    $(() => (async () => {
        if (document.getElementsByClassName("votebox")[0] && mw.config.get("wgTitle").startsWith("提案/讨论中提案/")) {
            const api = new mw.Api;
            const $body = $("body");
            const PAGENAME = mw.config.get("wgPageName");
            const isBot = mw.config.get("wgUserGroups").includes("flood"); // 用户是否拥有机器用户权限
        
            // 从[[Module:UserGroup/data]]中获取当前各用户组人员列表
            const userGroup = await api.post({
                action: "query",
                titles: "Module:UserGroup/data",
                prop: "revisions",
                rvprop: "content",
                rvlimit: 1,
            });
            const userList = JSON.parse(Object.values(userGroup.query.pages)[0].revisions[0]["*"]);
            class ReminderWindow extends OO.ui.ProcessDialog {
                static static = {
                    ...super.static,
                    tagName: "div",
                    name: "lr-reminder",
                    title: wgULS("一键发送投票提醒", "一鍵發送投票提醒"),
                    actions: [
                        {
                            action: "cancel",
                            label: "取消",
                            flags: ["safe", "close", "destructive"],
                        },
                        {
                            action: "submit",
                            label: wgULS("确认", "確認"),
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
        
                    // 获取标题
                    this.proposalTitleBox = new OO.ui.TextInputWidget({
                        value: PAGENAME.substring(PAGENAME.lastIndexOf("/") + 1, PAGENAME.length),
                        validate: "non-empty",
                    });
                    const proposalTitleField = new OO.ui.FieldLayout(this.proposalTitleBox, {
                        label: wgULS("提案标题", "提案標題"),
                        align: "top",
                    });
        
        
                    this.panelLayout.$element.append(
                        proposalTitleField.$element,
                    );
                    this.$body.append(this.panelLayout.$element);
                }
        
                // 发送提醒
                async remind() {
                    const errorList = [];
                    const link = `[[萌娘百科_talk:提案/讨论中提案/${this.proposalTitleBox.getValue()}|${this.proposalTitleBox.getValue()}]]`;
                    for (const userName of [...userList.sysop, ...userList.patroller]) {
                        const d = await api.postWithToken("csrf", {
                            format: "json",
                            action: "edit",
                            section: "new",
                            watchlist: "nochange",
                            tags: "Automation tool",
                            bot: isBot ? true : false,
                            title: `User_talk:${userName}`,
                            sectiontitle: "投票提醒",
                            text: `您好，提案${link}已经开始投票，请您及时投票喵～——~~~~`,
                        })
                            .done(() => {
                                mw.notify(wgULS(`向用户${userName}发送投票提醒成功。`, `向使用者${userName}發送投票提醒成功。`));
                            });
                        if (d.error) {
                            mw.notify(wgULS(`向${userName}发送投票提醒失败：${d.error.code}。`, `向${userName}發送投票提醒失敗：${d.error.code}。`));
                            errorList.push(userName);
                        }
                    }
                    return errorList;
                }
        
                getActionProcess(action) {
                    if (action === "cancel") {
                        return new OO.ui.Process(() => {
                            this.close({ action });
                        }, this);
                    } else if (action === "submit") {
                        return new OO.ui.Process($.when((async () => {
                            try {
                                const errorList = await this.remind();
                                this.close({ action });
                                if (errorList.length > 0) {
                                    oouiDialog.alert(errorList.join("、"), {
                                        title: wgULS("向以下用户发送提醒失败", "向以下使用者發送提醒失敗"),
                                        size: "small",
                                    });
                                }
                            } catch (e) {
                                console.error("OOUI error:", e);
                                throw new OO.ui.Error(e);
                            }
                            
                        })()).promise(), this);
                    }
                    return super.getActionProcess(action);
                }
            }
        
        
            // 添加按钮和窗口
            const windowManager = new OO.ui.WindowManager();
            $body.append(windowManager.$element);
            const reminderDialog = new ReminderWindow({
                size: "large",
            });
            windowManager.addWindows([reminderDialog]);
        
            $(mw.util.addPortletLink("p-cactions", "#", "投票提醒", "vote-remind", wgULS("一键发送投票提醒", "一鍵發送投票提醒"), "r")).on("click", (e) => {
                e.preventDefault();
                windowManager.openWindow(reminderDialog);
                $body.css("overflow", "auto");
            });
        }
    })());
});

/* </pre> */