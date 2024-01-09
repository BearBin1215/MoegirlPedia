import Loger from "../../components/Loger";
import "./index.less";

$(() => (async () => {
    if (mw.config.get("wgPageName") !== "Special:BulkMove") {
        await mw.loader.using(["mediawiki.util"]);
        mw.util.addPortletLink("p-tb", "/Special:BulkMove", "批量移动", "t-bulkmove");
        return;
    }
    await mw.loader.using(["mediawiki.api", "oojs-ui", "mediawiki.user"]);
    const api = new mw.Api();
    const loger = new Loger();
    let rowCount = 0;

    /**
     * 实现sleep效果，使用时需要加上await
     * @param {number} time 等待时间（ms）
     * @returns
     */
    const waitInterval = (time) => new Promise((resolve) => setTimeout(resolve, time));

    /**
     * 添加表格行
     * @param {number} count 行数
     */
    const addRow = (count = 1) => {
        for (let i = 0; i < count; i++) {
            rowCount++;
            $("#bm-page-list-table tbody").append($("<tr>")
                .append($(`<td><input type="text" data-row-no="${rowCount}" data-col-no="1" name="${rowCount}-1"></td>`))
                .append($(`<td><input type="text" data-row-no="${rowCount}" data-col-no="2" name="${rowCount}-2"></td>`))
                .append($('<td><div class="remove-row oo-ui-icon-subtract" title="删除此行"></div></td>')));
        }
    };

    /**
     * 在Special:BulkMove构建页面
     */
    mw.config.set("wgCanonicalSpecialPageName", "BulkMove");
    document.title = "批量移动 - 萌娘百科_万物皆可萌的百科全书";
    $(".mw-invalidspecialpage").removeClass("mw-invalidspecialpage");
    $("#firstHeading").html("批量移动页面<div>By BearBin</div>");
    $("#contentSub").remove();
    $("#mw-content-text").html([
        '<h3>页面列表</h3>',
        '<table id="bm-page-list-table">',
        '<thead>',
        '<tr>',
        '<th></th>',
        '<th>源页面</th>',
        '<th>目标页面</th>',
        '<th><div class="oo-ui-icon-add" id="bm-add-row" title="新增一行"></div></th>',
        '</tr>',
        '</thead>',
        '<tbody></tbody>',
        '</table>',
        '<ul class="bearbintools-notelist">',
        '<li>请输入要移动的页面列表及目标页面，一一对应。</li>',
        '<li>点击右上角“+”添加一行，长按可连续添加。</li>',
        '<li>可直接从Excel复制（部分浏览器可能不支持）。粘贴时浏览器可能会需要获取权限，请注意是否有提醒。</li>',
        '</ul>',
        '<div id="bm-option"></div>',
        '<div id="bm-submit-panel"></div>',
        '<ul class="bearbintools-notelist">',
        '<li>操作间隔单位为秒（s），不填默认为0。不包含本身移动页面所用的服务器响应时间。</li>',
        '<li>请注意<a target="_blank" href="/萌娘百科:机器用户">机器用户方针</a>所规定的速率和<a target="_blank" href="/api.php?action=query&meta=userinfo&uiprop=ratelimits">ratelimit限制</a>并自行设置间隔，或申请机器用户权限。</li>',
        '</ul>',
    ].join("")).append($(loger.element));
    addRow(10); // 先加十行

    // 移动选项
    const moveTalkWidget = new OO.ui.CheckboxInputWidget({
        id: "bm-movetalk-box",
        selected: true,
    });
    const moveTalkSelect = new OO.ui.FieldLayout(moveTalkWidget, {
        label: "移动关联的讨论页",
        align: "inline",
        id: "bm-movetalk",
    });
    const redirectWidget = new OO.ui.CheckboxInputWidget({ id: "bm-redirect-box" });
    const noredirectSelect = new OO.ui.FieldLayout(redirectWidget, {
        label: "保留重定向",
        align: "inline",
        id: "bm-redirect",
    });
    const watchlistWidget = new OO.ui.CheckboxInputWidget({
        id: "bm-watchlist-box",
    });
    const watchlistSelect = new OO.ui.FieldLayout(watchlistWidget, {
        label: "监视源页面和目标页面",
        align: "inline",
        id: "bm-watchlist",
    });
    $("#bm-option").append(
        moveTalkSelect.$element,
        noredirectSelect.$element,
        watchlistSelect.$element,
    );

    // 操作面板
    const submitButton = new OO.ui.ButtonWidget({
        label: "提交",
        flags: [
            "primary",
            "progressive",
        ],
        icon: "check",
        id: "bm-submit",
    });
    const intervalBox = new OO.ui.TextInputWidget({
        placeholder: "操作间隔",
        id: "bm-interval",
    });
    const reasonBox = new OO.ui.TextInputWidget({
        placeholder: "附加摘要",
        id: "bm-reason",
        name: "wpReason",
    });
    $("#bm-submit-panel").append(
        submitButton.$element,
        intervalBox.$element,
        reasonBox.$element,
    );
    mw.user.getRights().done((result) => {
        if (!result.includes("suppressredirect")) {
            redirectWidget.setSelected(true).setDisabled(true);
        }
    });

    const addRowBox = new OO.ui.TextInputWidget({
        type: "number",
        value: 1,
    });

    // 点击按钮打开弹窗提示添加行
    $("#bm-add-row").on("click", async () => {
        const confirm = await OO.ui.confirm(addRowBox.$element, {
            title: "增加行",
        });
        if (confirm) {
            addRow(+addRowBox.getValue());
        }
    });

    // 点击按钮删除行
    $("#bm-page-list-table").on("click", ".remove-row", function () {
        rowCount--;
        $(this).closest("tr").remove();
        $("#bm-page-list-table tbody tr").each((i, ele) => {
            $(ele).find("input").attr("data-row-no", i + 1);
        });
    });

    // 从剪贴板粘贴
    $("#bm-page-list-table").on("paste", 'input[type="text"]', function (e) {
        navigator.clipboard.readText().then((text) => {
            if (text.indexOf("\t") > -1 || text.indexOf("\n") > -1 && text.indexOf("\n") !== text.length - 1) {
                e.preventDefault();
                const rows = text.split("\n");
                const $inputs = $("#bm-page-list-table input[data-row-no][data-col-no]");
                for (let i = 0; i < rows.length; i++) {
                    const columns = rows[i].split("\t");
                    for (let j = 0; j < 2; j++) {
                        if (columns[j]?.trim().length > 0) { // 经过split可能产生空字符串，要去掉
                            const rowNo = i + Number($(this).attr("data-row-no"));
                            const colNo = j + Number($(this).attr("data-col-no"));
                            $inputs.filter(`[data-row-no="${rowNo}"][data-col-no="${colNo}"]`).val(columns[j]);
                        }
                    }
                }
            }
        });
    });

    // 日志筛选
    $("#bearbintools-log-state>div").each((_, ele) => {
        let show = true;
        const $ele = $(ele);
        $ele.on("click", (e) => {
            e.preventDefault();
            if (show) {
                $("#bearbintools-log-lines").addClass(`${$ele.attr("id")}-hide`);
                $ele.removeClass("log-selected");
                show = false;
            } else {
                $("#bearbintools-log-lines").removeClass(`${$ele.attr("id")}-hide`);
                $ele.addClass("log-selected");
                show = true;
            }
        });
    });

    // 执行体
    submitButton.on("click", async () => {
        const confirmText = $("<p>请确认您的移动是否有误。若因输入不当而产生错误，请自行<ruby><rb>承担后果</rb><rp>(</rp><rt>料理后事</rt><rp>)</rp></ruby>。</p>");
        const confirm = await OO.ui.confirm(confirmText, {
            title: "提醒",
            size: "small",
        });
        if (confirm) {
            submitButton.setDisabled(true);
            window.onbeforeunload = () => true;
            $("#mw-content-text input, #mw-content-text textarea").prop("disabled", true);

            const movetalk = moveTalkWidget.isSelected();
            const noredirect = !redirectWidget.isSelected();
            const watchlist = watchlistWidget.isSelected() ? "watch" : "unwatch";
            console.log(movetalk, noredirect, watchlist);
            const reason = reasonBox.getValue().length > 0 ? `[[User:BearBin/js#批量移动页面|BulkMove]]：${reasonBox.getValue()}` : "[[User:BearBin/js#批量移动页面|BulkMove]]";
            const interval = Number(intervalBox.getValue()) * 1000;
            const tags = mw.config.get("wgUserGroups").includes("bot") ? "bot" : "Automation tool";
            const pageList = [];

            $("#bm-page-list-table tbody tr").each((_, tr) => {
                const from = $(tr).find("input")[0].value;
                const to = $(tr).find("input")[1].value;
                if (from?.length > 0 && to?.length > 0) {
                    pageList.push({ from, to });
                }
            });
            if (pageList.length > 0) {
                loger.record(`共${pageList.length}个页面，即将开始移动。`);
            } else {
                loger.record("没有要移动的页面。");
            }
            for (const page of pageList) {
                const {
                    from,
                    to,
                } = page;
                try {
                    const result = await api.postWithToken("csrf", {
                        format: "json",
                        action: "move",
                        from,
                        to,
                        movetalk,
                        noredirect,
                        watchlist,
                        reason,
                        tags,
                        bot: true,
                    });
                    if (result.move) {
                        loger.record(`移动【<a href="/${from}${noredirect ? "" : "?redirect=no"}" class="${noredirect ? "" : "mw-redirect"}">${from}</a>】→【<a href="/${to}">${to}</a>】成功。`, "success");
                        await waitInterval(interval);
                    }
                } catch (e) {
                    let errorMessage = "";
                    switch (e) {
                        case "missingtitle":
                            errorMessage = "源页面不存在";
                            break;
                        case "articleexists":
                            errorMessage = "目标页面已存在";
                            break;
                        case "http":
                            errorMessage = "网络连接出错";
                            break;
                        default:
                            errorMessage = e;
                    }
                    loger.record(`移动【<a href="/${from}">${from}</a>】→【<a href="/${to}">${to}</a>】失败：${errorMessage}。`, "error");
                }
            }
            loger.record("移动完毕。");
            submitButton.setDisabled(false);
            window.onbeforeunload = () => null;
            $("#mw-content-text input, #mw-content-text textarea").prop("disabled", false);
        }
    });
})());