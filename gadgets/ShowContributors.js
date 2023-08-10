// eslint-disable-next-line
var _addText = '{{Documentation|content=本小工具用于在主、模板、分类、帮助、模块名字空间列出本页贡献者，统计贡献者的编辑次数和增删字节数。\n\n使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码<pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("/index.php?title=User:BearBin/js/ShowContributors.js&action=raw&ctype=text/javascript");</pre>}}';

"use strict";
$(() => (async () => {
    if (
        ![0, 10, 12, 14, 828].includes(mw.config.get("wgNamespaceNumber")) ||
        mw.config.get("wgArticleId") === 0 ||
        mw.config.get("wgAction") !== "view"
    ) { return; }
    await mw.loader.using(["mediawiki.api", "mediawiki.notification", "oojs-ui", "jquery.tablesorter"]);
    mw.loader.addStyleTag(`
    #show-contributor-block {
        text-align: right;
    }
    #firstHeading {
        margin-bottom: 0;
    }
    #show-contributor-header {
        position: sticky;
        top: 0;
        background: #FFF;
        padding: .3em;
        text-align: center;
        border-bottom: 1px solid #aaa;
        font-weight: 600;
    }
    #show-contributor-headline {
        font-size: 1.3em;
    }
    #show-contributor-close {
        position: absolute;
        top: 0;
        right: 0;
        width: 1em;
        height: 1em;
        line-height: 1;
        cursor: pointer;
        padding: .3em;
        font-size: 1.2em;
        border-radius: 50%;
    }
    #show-contributor-close:hover {
        background-color: #eee;
    }
    #show-contributor-table {
        width: 100%;
        margin: 0;
    }
    #show-contributor-table .user-avatar {
        border-radius: 50%;
        width: 20px;
        height: 20px;
    }`);
    class ContributorDialog extends OO.ui.Dialog {
        static static = {
            ...super.static,
            name: "ShowContributor",
            size: "large",
        };
        initialize() {
            super.initialize();

            // 标题和关闭按钮
            this.$headline = $('<div id="show-contributor-headline">本页贡献统计</div>');
            this.$closeButton = $('<div id="show-contributor-close">×</div>');
            this.$header = $('<div id="show-contributor-header"></div>').append(
                this.$headline,
                this.$closeButton,
            );
            // 点击关闭
            this.$closeButton.on("click", () => this.close());

            // 统计表
            this.$thead = $("<thead><th>用户</th><th>编辑数</th><th>增加字节数</th><th>删减字节数</th></thead>");
            this.$tbody = $("<tbody></tbody>");
            this.$table = $('<table id="show-contributor-table" class="wikitable"></div>').append(
                this.$thead,
                this.$tbody,
            );

            this.$body.append(
                this.$header,
                this.$table,
            );
        }

        /**
         * 获取贡献者
         * @returns 贡献者及其编辑情况
         */
        getContributors = async () => {
            const api = new mw.Api();
            const contributors = {};
            let rvcontinue = undefined;
            let prevSize = 0; // 用于记录上次编辑的字节数
            const config = {
                action: "query",
                format: "json",
                prop: "revisions",
                titles: mw.config.get("wgPageName"),
                rvprop: "user|size",
                rvlimit: "max",
                rvdir: "newer",
            };

            // 循环获取所有编辑记录的用户和字节
            while (rvcontinue !== false) {
                if (typeof rvcontinue !== "undefined") {
                    config[rvcontinue] = rvcontinue;
                }
                try {
                    const res = await api.get(config);
                    rvcontinue = res.continue?.rvcontinue || false;
                    for (const item of Object.values(res.query.pages)[0].revisions) {
                        contributors[item.user] ||= [];
                        contributors[item.user].push(item.size - prevSize);
                        prevSize = item.size;
                    }
                } catch (error) {
                    mw.notify(`获取编辑记录失败：${error}`, { type: "error" });
                }
            }
            return contributors;
        };

        // 向表格添加一行
        addRow = ($tbody, data) => {
            $tbody.append($("<tr></tr>").append(
                `<td><a href="/User:${data.user}"><img class="user-avatar" src="https://commons.moegirl.org.cn/extensions/Avatar/avatar.php?user=${data.user}" />${data.user}</a></td>`,
                `<td>${data.count}</td>`,
                `<td>${data.add}</td>`,
                `<td>${data.remove}</td>`,
            ));
        };

        // 分析数据，展示结果
        showContributors = (contributors) => {
            for (const key in contributors) {
                let add = 0,
                    remove = 0;
                for (const item of contributors[key]) {
                    if (item > 0) {
                        add += item;
                    } else {
                        remove += item;
                    }
                }
                this.addRow(this.$tbody, {
                    user: key,
                    count: contributors[key].length,
                    add,
                    remove,
                });
            }
        };
    }

    const windowManager = new OO.ui.WindowManager({
        id: "show-contributor",
    });
    $("body").append(windowManager.$element);
    const SCDialog = new ContributorDialog();
    windowManager.addWindows([SCDialog]);

    const contributorButton = new OO.ui.ButtonWidget({
        label: "本页贡献者",
        icon: "search",
        flags: "progressive",
        id: "show-contributor-button",
    });
    const $contributorBlock = $('<div id="show-contributor-block"></div>').append(contributorButton.$element);
    switch (mw.config.get("skin")) {
        case "moeskin":
            $("#moe-article-header-title").after($contributorBlock);
            break;
        case "vector":
        default:
            $("#firstHeading").after($contributorBlock);
            break;
    }

    contributorButton.on("click", async () => {
        mw.notify("正在加载本页贡献者，请稍等……");
        const contributors = await SCDialog.getContributors();
        SCDialog.showContributors(contributors);
        SCDialog.$table.tablesorter();
        windowManager.openWindow(SCDialog);
    });
})());