/**
 * <pre> 
 * @rights edit
 * @dependencies ["mediawiki.api", "mediawiki.util", "mediawiki.notification", "oojs-ui-core", "ext.gadget.site-lib"]
 */

// eslint-disable-next-line
var _addText = '{{Documentation|content=<p>本小工具用于在提案和权限变更版快速提醒用户参与投票。</p><p>使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码</p><pre class="prettyprint lang-javascript">mw.loader.load("/index.php?title=User:BearBin/js/voteRemind.js&action=raw&ctype=text/javascript");</pre><p>如果您不想收到提醒，请前往[[User:BearBin/js/voteRemind.js/Noremind]]取消订阅。</p>}}';

"use strict";
$(() => (async () => {
    await mw.loader.using(["mediawiki.api", "mediawiki.util", "mediawiki.notification", "oojs-ui-core", "ext.gadget.site-lib"]);
    if (document.getElementsByClassName("votebox")[0] && (mw.config.get("wgTitle").startsWith("提案/讨论中提案/") || mw.config.get("wgTitle") === "讨论版/权限变更")) {
        const api = new mw.Api;
        const $body = $("body");
        const PAGENAME = mw.config.get("wgPageName");
        const isProposal = mw.config.get("wgTitle") === "讨论版/权限变更" ? false : true; // 提案还是人事案
        const isBot = mw.config.get("wgUserGroups").includes("flood"); // 用户是否拥有机器用户权限

        // 从[[Module:UserGroup/data]]获取当前各用户组人员列表
        const userGroup = await api.post({
            action: "query",
            titles: "Module:UserGroup/data",
            prop: "revisions",
            rvprop: "content",
            rvlimit: 1,
        });
        const userList = JSON.parse(Object.values(userGroup.query.pages)[0].revisions[0]["*"]);

        // 从[[User:BearBin/js/voteRemind.js/Noremind]]获取不愿意收到投票提醒的用户
        const Noremind = await api.post({
            action: "query",
            titles: "User:BearBin/js/voteRemind.js/Noremind",
            prop: "revisions",
            rvprop: "content",
            rvlimit: 1,
        });
        const userExcluded = Object.values(Noremind.query.pages)[0].revisions[0]["*"].split(/\n\* */);

        // 已投票的用户列表
        const hrefList = [];
        $(".votebox ~ ol a[href^='/User'], .votebox ~ ol a[href^='/index.php?title=User']").each(function(){
            hrefList.push(this.href);
        });
        const userVoted = [];
        for(const item of hrefList) {
            userVoted.push(decodeURI(item.replace(/.*User(_talk)?:([^&]*).*/g, "$2")));
        }
            
        // 获取{{投票}}模板所在讨论串二级标题内.mw-headline的id值
        const mwHeadlines = $(".votebox").parent(".discussionContainer").children("h2").children(".mw-headline");
        const headlines = [];
        for (const item of mwHeadlines) {
            headlines.push(item.id);
        }

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

                // 提案，输入标题
                this.proposalTitleBox = new OO.ui.TextInputWidget({
                    value: PAGENAME.substring(PAGENAME.lastIndexOf("/") + 1, PAGENAME.length),
                    validate: "non-empty",
                });
                const proposalTitleField = new OO.ui.FieldLayout(this.proposalTitleBox, {
                    label: wgULS("提案标题", "提案標題"),
                    align: "top",
                });

                // 人事案，选择章节标题
                this.sectionTitleDropdown = new OO.ui.DropdownInputWidget({
                    options: [
                        ...headlines.map((v) => ({
                            data: v,
                            label: v.replaceAll("_", " "),
                        })),
                    ],
                });
                const sectionTitleFiled = new OO.ui.FieldLayout(this.sectionTitleDropdown, {
                    label: wgULS("人事案标题", "人事案標題"),
                    align: top,
                });

                this.groupsRadioSelect = new OO.ui.RadioSelectWidget({
                    items: [
                        new OO.ui.RadioOptionWidget({ data: "p", label: "管理员、巡查姬" }), // 管、监、查、行
                        new OO.ui.RadioOptionWidget({ data: "s", label: "管理员" }), // 脚
                        new OO.ui.RadioOptionWidget({ data: "i", label: "管理员、界面管理员" }), // 界
                    ],
                });
                const groupsFiled = new OO.ui.FieldLayout(this.groupsRadioSelect, {
                    label: wgULS("要提醒的用户组", "要提醒的用戶組"),
                    align: top,
                });

                // 提案仅需输入标题，人事案选择标题和要通知的用户组。
                if (isProposal) {
                    this.panelLayout.$element.append(
                        proposalTitleField.$element,
                    );
                } else {
                    this.panelLayout.$element.append(
                        sectionTitleFiled.$element,
                        groupsFiled.$element,
                    );
                }

                this.$body.append(this.panelLayout.$element);
            }

            // 生成提醒用户列表
            getUsersToVote() {
                let usersToVote;
                if(isProposal) {
                    usersToVote = [...userList.sysop, ...userList.patroller];
                } else {
                    switch (this.groupsRadioSelect.findSelectedItem()?.getData?.()) {
                        case "p":
                            usersToVote = [...userList.sysop, ...userList.patroller];
                            break;
                        case "s":
                            usersToVote = userList.sysop;
                            break;
                        case "i":
                            usersToVote = Array.from(new Set([...userList.sysop, ...userList["interface-admin"]]));
                    }
                }
                const setExcluded = new Set([...userExcluded, ...userVoted]);
                return usersToVote.filter((x) => !setExcluded.has(x));
            }

            // 生成链接
            getLink() {
                if (isProposal) {
                    return `[[萌娘百科_talk:提案/讨论中提案/${this.proposalTitleBox.getValue()}|${this.proposalTitleBox.getValue().replaceAll("_", " ")}]]`;
                }
                return `[[萌娘百科_talk:讨论版/权限变更#${this.sectionTitleDropdown.getValue()}|${this.sectionTitleDropdown.getValue().replaceAll("_", " ")}]]`;
            }

            // 发送提醒
            async remind() {
                const errorList = [];
                const link = this.getLink();
                for (const userName of this.getUsersToVote()) {
                    const d = await api.postWithToken("csrf", {
                        format: "json",
                        action: "edit",
                        section: "new",
                        watchlist: "nochange",
                        tags: "Automation tool",
                        bot: isBot ? true : false,
                        title: `User_talk:${userName}`,
                        sectiontitle: "投票提醒",
                        text: `<i style="font-size:small">本通知使用一键提醒小工具发出，如出现错误，请联系[[User_talk:BearBin|BearBin]]。若不希望接到此提醒，请在[[User:BearBin/js/voteRemind.js/Noremind|这个页面]]记录您的用户名。</i><br/>您好，${isProposal ? "提案" : "人事案"}${link}已经开始投票。您尚未投票，请及时参与喵～——~~~~`,
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
            size: "medium",
        });
        windowManager.addWindows([reminderDialog]);

        $(mw.util.addPortletLink("p-cactions", "#", "投票提醒", "vote-remind", wgULS("一键发送投票提醒", "一鍵發送投票提醒"), "r")).on("click", (e) => {
            e.preventDefault();
            windowManager.openWindow(reminderDialog);
            $body.css("overflow", "auto");
        });
    }
})());

/* </pre> */