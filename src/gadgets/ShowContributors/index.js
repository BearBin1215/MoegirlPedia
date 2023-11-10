import "./index.less";

$(() => (async () => {
    if (
        ![0, 2, 4, 10, 12, 14, 828, 274].includes(mw.config.get("wgNamespaceNumber")) ||
        mw.config.get("wgArticleId") === 0 ||
        mw.config.get("wgAction") !== "view"
    ) { return; }
    await mw.loader.using([
        "mediawiki.api",
        "mediawiki.notification",
        "oojs-ui",
        "oojs-ui.styles.icons-interactions", // 提供关闭窗口按钮
        "jquery.tablesorter", // 提供表格排序功能
    ]);
    class ContributorDialog extends OO.ui.Dialog {
        static static = {
            ...super.static,
            name: "ShowContributor",
            size: "large",
        };
        got = false;
        initialize() {
            super.initialize();

            // 标题和关闭按钮
            this.$headline = $('<div id="show-contributor-headline">本页贡献统计</div>');
            this.closeButton = new OO.ui.IconWidget({
                icon: "close",
                id: "show-contributor-close",
            });
            this.$header = $('<div id="show-contributor-header"></div>').append(
                this.$headline,
                this.closeButton.$element,
            );
            // 点击关闭
            this.closeButton.$element.on("click", () => this.close());

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
                `<td><a href="${mw.config.get("wgArticlePath").replace("$1", `User:${data.user}`)}"><img class="user-avatar" src="https://commons.moegirl.org.cn/extensions/Avatar/avatar.php?user=${data.user}" />${data.user}</a></td>`,
                `<td>${data.count}</td>`,
                `<td>${data.add}</td>`,
                `<td>${data.remove}</td>`,
            ));
        };

        // 分析数据，展示结果
        showContributors = (contributors) => {
            this.$tbody.empty();
            for (const key in contributors) {
                this.addRow(this.$tbody, {
                    user: key,
                    count: contributors[key].length,
                    add: contributors[key].reduce((acc, cur) => cur > 0 ? acc + cur : acc, 0),
                    remove: contributors[key].reduce((acc, cur) => cur < 0 ? acc + cur : acc, 0),
                });
            }
            this.got = true;
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
    switch (mw.config.get("skin")) {
        case "moeskin":
            $("#tagline").prepend(contributorButton.$element);
            break;
        case "vector":
        default:
            $("#bodyContent").prepend(contributorButton.$element);
            break;
    }

    contributorButton.on("click", async () => {
        if(!SCDialog.got) {
            contributorButton.setLabel("正在查询");
            const contributors = await SCDialog.getContributors();
            SCDialog.showContributors(contributors);
            SCDialog.$table.tablesorter();
            contributorButton.setLabel("本页贡献者");
        }
        windowManager.openWindow(SCDialog);
    });
})());