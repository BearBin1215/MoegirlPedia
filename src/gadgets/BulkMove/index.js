// eslint-disable-next-line
var _addText = '{{Documentation|content=本小工具用于批量移动页面。\n\n使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码：\n<pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("/index.php?title=User:BearBin/js/BulkMove.js&action=raw&ctype=text/javascript");</pre>\n加入后，可以在[[Special:BulkMove]]、[[Special:批量移动]]等页面进行批量移动操作。}}';

"use strict";
// <pre>
$(() => (async () => {
    if (!["special:bulkmove", "special:批量移动", "special:批量移動", "特殊:bulkmove"].includes(mw.config.get("wgPageName").toLowerCase())) {
        await mw.loader.using(["mediawiki.util"]);
        mw.util.addPortletLink("p-tb", "/Special:BulkMove", "批量移动", "t-bulkmove");
        return;
    }
    await mw.loader.using(["mediawiki.api", "oojs-ui", "mediawiki.user"]);
    const api = new mw.Api();
    let rowCount = 0;
    let successCount = 0;
    let errorCount = 0;

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
     * 记录日志
     * @param {string} info 日志内容
     * @param {string} type 日志类型，normal/success/warn/error
     */
    const record = (info, type = "normal") => {
        $("#bearbintools-log-lines").append(`<li class="log-${type}">${new Date().toLocaleTimeString()} - ${info}</li>`);
        const message = document.getElementById("bearbintools-log-lines");
        message.scrollTop = message.scrollHeight;
    };

    /**
     * 在Special:BulkMove构建页面
     */
    mw.config.set("wgCanonicalSpecialPageName", "BulkMove");
    $("title").text("批量移动 - 萌娘百科_万物皆可萌的百科全书");
    $("head").append(`<style>
        #firstHeading {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: flex-end;
        }
        #firstHeading>div {
            font-size: .6em;
        }
        #bodyContent {
            padding-right: 0 !important;
        }
        #mw-content-text h3 {
            margin-bottom: 0;
        }
        #bm-page-list-table {
            border-collapse: collapse;
            width: 100%;
            max-width: 900px;
        }
        #bm-page-list-table tbody {
            counter-reset: row-counter;
        }
        #bm-page-list-table tbody tr {
            counter-increment: row-counter;
        }
        #bm-page-list-table tbody tr:before {
            content: counter(row-counter);
            display: table-cell;
            width: 0;
            padding-right: .3em;
            text-align: center;
            vertical-align: middle;
        }
        #bm-page-list-table td {
            padding: 0;
            border: 1px solid #aaa;
            background-color: rgba(255, 255, 255, .7);
        }
        #bm-page-list-table th:last-child,
        #bm-page-list-table td:last-child {
            border: none;
            width: 20px;
            background-position: center;
            background-color: transparent;
        }
        #bm-add-row, .remove-row {
            width: 20px;
            height: 20px;
            cursor: pointer;
            border-radius: 50%;
            transition: .2s ease background;
        }
        #bm-add-row:hover, .remove-row:hover {
            background-color: rgba(127, 127, 127, .2)
        }
        /* 傻逼萌皮 */
        #mw-content-text #bm-page-list-table input[type="text"] {
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            padding: .4em;
            border: none;
            border-radius: 0;
            background: transparent;
        }
        #mw-content-text #bm-page-list-table input[type="text"]:focus {
            outline: none;
            background-color: rgba(127, 127, 127, .02);
        }
        #mw-content-text ul.bearbintools-notelist {
            margin: .4em 0 0 1.6em;
        }
        #bm-submit-panel, #bm-option {
            margin-top: .8em;
        }
        #bm-submit-panel {
            display: flex;
            gap: .1rem;
        }
        #bm-interval {
            flex: 0 0 5.5em;
        }
        #bm-summary {
            max-width: initial;
        }
        #bm-option>div {
            margin-top: .3em;
        }
        .state {
            display: inline-block;
            width: 1.2em;
            height: 1em;
            line-height: 1em;
            text-align: center;
        }
        #bearbintools-log {
            display: flow-root;
            padding: .3em;
            border: 1px solid #ccc;
            background: rgba(255, 255, 255, .7);
        }
        #bearbintools-log-clear {
            padding-left: .5em;
            font-size: 1rem;
            font-weight: 400;
            user-select: none;
        }
        #bearbintools-log-state {
            float: right;
            padding: .4em;
        }
        #bearbintools-log-state>div {
            border-radius: 0.3em;
            margin-bottom: 0.2em;
            padding-right: 0.2em;
            cursor: pointer;
        }
        #bearbintools-log-state>div.log-selected {
            background-color: rgba(127, 127, 127, .07);
        }
        #bearbintools-log-lines.log-success-hide .log-success,
        #bearbintools-log-lines.log-nochange-hide .log-nochange,
        #bearbintools-log-lines.log-error-hide .log-error,
        #bearbintools-log-lines.log-warn-hide .log-warn {
            display: none;
        }
        .log-success {
            color: #333;
        }
        .log-nochange {
            color: #888;
        }
        .log-warn {
            color: #f28500;
        }
        .log-error {
            color: #eb3941;
        }
        #bearbintools-log-lines {
            font-family: monospace;
        }
        #bearbintools-log-lines a {
            color: inherit;
            text-decoration: underline dotted;
        }
    </style>`);
    $(".mw-invalidspecialpage").removeClass("mw-invalidspecialpage");
    $("#firstHeading").html("批量移动页面<div>By BearBin</div>");
    $("#contentSub").remove();
    $("#mw-content-text").html(`
        <h3>页面列表</h3>
        <table id="bm-page-list-table">
            <thead>
                <tr>
                    <th></th>
                    <th>源页面</th>
                    <th>目标页面</th>
                    <th><div class="oo-ui-icon-add" id="bm-add-row" title="新增一行"></div></th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <ul class="bearbintools-notelist">
            <li>请输入要移动的页面列表及目标页面，一一对应。</li>
            <li>点击右上角“+”添加一行，长按可连续添加。</li>
            <li>可直接从Excel复制（部分浏览器可能不支持）。复制粘贴时浏览器可能会需要获取权限，请注意是否有提醒。</li>
        </ul>
        <div id="bm-option"></div>
        <div id="bm-submit-panel"></div>
        <ul class="bearbintools-notelist">
            <li>操作间隔单位为秒（s），不填默认为0。不包含本身移动页面所用的服务器响应时间。</li>
            <li>请注意<a target="_blank" href="/萌娘百科:机器用户">机器用户方针</a>所规定的速率和<a target="_blank" href="/api.php?action=query&meta=userinfo&uiprop=ratelimits">ratelimit限制</a>并自行设置间隔，或申请机器用户权限。</li>
        </ul>
        <h3 id="bearbintools-log-title">日志<a id="bearbintools-log-clear">[清空]</a></h3>
        <div id="bearbintools-log">
            <div id="bearbintools-log-state">
                <div class="log-success log-selected" id="log-success"><span class="state">✓</span><span id="state-success">0</span> 完成</div>
                <div class="log-error log-selected" id="log-error"><span class="state">✕</span><span id="state-error">0</span> 出错</div>
                <div class="log-warn log-selected" id="log-warn"><span class="state">!</span><span id="state-error">0</span> 警告</div>
            </div>
            <ul id="bearbintools-log-lines"></ul>
        </div>
    `);
    addRow(10); // 先加十行

    // 移动选项
    const moveTalkSelect = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
        id: "bm-movetalk-box",
        selected: true,
    }), {
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
    const watchlistSelect = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
        id: "bm-watchlist-box",
    }), {
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

    // 点击按钮添加一行，长按连续添加
    let addRowInterval;
    $("#bm-add-row").on("mousedown", () => {
        addRowInterval = setInterval(() => {
            addRow();
        }, 200);
    }).on("mouseup", () => {
        clearInterval(addRowInterval);
        addRow();
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

    // 清空日志
    $("#bearbintools-log-clear").on("click", () => {
        $("#bearbintools-log-lines").html("");
        $("#state-success, #state-warn, #state-error").text(0);
        successCount = 0;
        errorCount = 0;
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

            const movetalk = $("#bm-movetalk-box input").prop("checked");
            const noredirect = !$("#bm-redirect-box input").prop("checked");
            const watchlist = $("#bm-watchlist-box input").prop("checked") ? "watch" : "unwatch";
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
                record(`共${pageList.length}个页面，即将开始移动。`);
            } else {
                record("没有要移动的页面。");
            }
            for (const item of pageList) {
                const from = item.from;
                const to = item.to;
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
                        record(`移动【<a href="/${from}${noredirect ? "" : "?redirect=no"}" class="${noredirect ? "" : "mw-redirect"}">${from}</a>】→【<a href="/${to}">${to}</a>】成功。`, "success");
                        $("#state-success").text(++successCount);
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
                    record(`移动【<a href="/${from}">${from}</a>】→【<a href="/${to}">${to}</a>】失败：${errorMessage}。`, "error");
                    $("#state-error").text(++errorCount);
                }
            }
            record("移动完毕。");
            submitButton.setDisabled(false);
            window.onbeforeunload = () => null;
            $("#mw-content-text input, #mw-content-text textarea").prop("disabled", false);
        }
    });
})());
// </pre>