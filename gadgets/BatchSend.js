/**
 * @description 批量发送讨论页消息
 * @author BearBin
 * <pre> 
 */

// eslint-disable-next-line
var _addText = '{{Documentation|content=本小工具用于快速向多名用户发送相同内容的讨论页消息。\n\n使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码\n<pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("/index.php?title=User:BearBin/js/BatchSend.js&action=raw&ctype=text/javascript");</pre>\n添加后，前往[[Special:BatchSend]]执行发送。\n\n如果您有好的建议，欢迎前往[[User_talk:BearBin|我的讨论页]]，或在GitHub上[https://github.com/BearBin1215/MoegirlPedia/issues 提交issue]。}}';

"use strict";
$(() => (async () => {
    if (mw.config.get("wgNamespaceNumber") !== -1 || !["batchsend", "群发提醒", "群发消息", "群發提醒"].includes(mw.config.get("wgTitle").toLowerCase())) {
        await mw.loader.using(["mediawiki.util"]);
        mw.util.addPortletLink("p-tb", "/Special:BatchSend", "群发提醒", "t-batchsend");
        return;
    } 
    await mw.loader.using(["mediawiki.api", "oojs-ui", "mediawiki.user"]);
    const api = new mw.Api();
    let successCount = 0;
    let errorCount = 0;
    let warnCount = 0;

    /**
     * 实现sleep效果，使用时需要加上await
     * @param {number} time 等待时间（ms）
     * @returns 
     */
    const waitInterval = (time) => new Promise((resolve) => setTimeout(resolve, time));

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
     * 解析内容
     * @param {string} sectiontitle 章节标题
     * @param {string} text 正文源代码
     * @returns HTML源代码
     */
    const preview = async (sectiontitle, text) => {
        const parseResult = await api.post({
            action: "parse",
            uselang: mw.config.get("wgUserLanguage"),
            section: "new",
            contentmodel: "wikitext",
            pst: true,
            sectiontitle,
            text,
        });
        return parseResult.parse.text["*"];
    };

    /**
     * 在目标用户讨论（子）页面新增章节
     * 
     * 返回的sendResult对象中，sendResult.edit.result为Success/Failure
     * 
     * 为Failure时，Object.keys(sendResult.edit)[0]为原因，sendResult.edit[Object.keys(sendResult.edit)[0]]为详情
     * @param {string} user 目标用户
     * @param {string} sectiontitle 新章节标题
     * @param {string} text 源代码
     * @returns 编辑结果
     */
    const send = async (title, sectiontitle, text, summary = "") => {
        const sendResult = await api.postWithToken("csrf", {
            format: "json",
            action: "edit",
            section: "new",
            watchlist: "nochange",
            tags: "Bot",
            bot: true,
            title,
            sectiontitle,
            text,
            summary,
        });
        return sendResult;
    };

    mw.config.set("wgCanonicalSpecialPageName", "BulkMove");
    $("title").text("群发提醒 - 萌娘百科_万物皆可萌的百科全书");
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
        #bs-previewzone {
            border: 1px solid #ccc;
            background: rgba(255, 255, 255, .7);
        }
        #bs-previewzone .mw-parser-output {
            padding: 0 1em 1em;
        }
        #bs-previewzone .oo-ui-pendingElement-pending {
            padding: 1em 0;
            text-align: center;
            font-size: 1.2em;
        }
        #bs-submit-panel {
            display: flex;
            gap: .1rem;
            margin-top: .8em;
        }
        #bs-interval {
            flex: 0 0 5.5em;
        }
        #mw-content-text .oo-ui-textInputWidget,
        #bs-summary {
            max-width: unset;
        }
        #mw-content-text ul.bearbintools-notelist {
            margin: .4em 0 0 1.6em;
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
    $("#firstHeading").html("群发讨论页消息<div>By BearBin</div>");
    $("#contentSub").remove();
    $("#mw-content-text").html(`
        <h3 id="bs-pagelist-headline">页面列表</h3>
        <h3 id="bs-headline-headline">标题</h3>
        <h3 id="bs-content-headline">正文</h3>
        <div id="bs-submit-panel"></div>
        <ul class="bearbintools-notelist">
            <li>发送间隔单位为秒（s），不包含本身编辑所用的服务器响应时间。</li>
            <li>非维护人员请注意<a target="_blank" href="/api.php?action=query&meta=userinfo&uiprop=ratelimits">ratelimit限制</a>和<a href="/萌娘百科:机器用户#其他规范">机器用户方针规定的速率</a>，自行设置间隔或申请机器用户以免撞墙或超速。</li>
            <li>摘要留空则会由系统自动生成。</li>
        </ul>
        <h3 id="bs-preview-headline">预览</h3>
        <div id="bs-previewzone"></div>
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
    const pagelistBox = new OO.ui.MultilineTextInputWidget({ // 目标页面列表输入框
        validate: "non-empty",
        placeholder: "使用换行分隔，一行一个\nUser talk前缀加不加都可以，支持发送至子页面",
        rows: 5,
        autosize: true,
        id: "bs-pagelist",
    });
    const headlineBox = new OO.ui.TextInputWidget({
        validate: "non-empty",
        id: "bs-headline",
    });
    const contentBox = new OO.ui.MultilineTextInputWidget({
        validate: "non-empty",
        rows: 10,
        autosize: true,
        id: "bs-content",
    });
    const submitButton = new OO.ui.ButtonWidget({
        label: "提交",
        flags: [
            "primary",
            "progressive",
        ],
        icon: "check",
        id: "bs-submit",
    });
    const previewButton = new OO.ui.ButtonWidget({
        label: "预览",
        flags: [
            "primary",
        ],
        id: "bs-preview",
    });
    const intervalBox = new OO.ui.TextInputWidget({
        placeholder: "发送间隔",
        id: "bs-interval",
    });
    const summaryBox = new OO.ui.TextInputWidget({
        placeholder: "编辑摘要",
        id: "bs-summary",
    });
    $("#bs-preview-headline, #bs-previewzone").hide();
    $("#bs-pagelist-headline").after(pagelistBox.$element);
    $("#bs-headline-headline").after(headlineBox.$element);
    $("#bs-content-headline").after(contentBox.$element);
    $("#bs-submit-panel").append(
        submitButton.$element,
        previewButton.$element,
        intervalBox.$element,
        summaryBox.$element,
    );

    // 监听页面列表、标题、内容栏的change事件，用户关闭页面时发出提醒
    for (const item of [pagelistBox, headlineBox, contentBox]) {
        item.on("change", () => {
            window.onbeforeunload = () => true;
        });
    }

    // 清空日志
    $("#bearbintools-log-clear").on("click", () => {
        $("#bearbintools-log-lines").html("");
        $("#state-success, #state-error, #state-warn").text(0);
        successCount = 0;
        errorCount = 0;
        warnCount = 0;
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

    // 点击预览按钮，根据用户输入的标题和内容生成预览，并展示在预览区域
    previewButton.on("click", async () => {
        previewButton.setDisabled(true); // 禁用预览按钮

        $("#bs-preview-headline, #bs-previewzone").show();
        $("#bs-previewzone").html('<div class="oo-ui-pendingElement-pending">正在加载预览……</div>');
        const previewResult = await preview(headlineBox.getValue(), contentBox.getValue());
        $("#bs-previewzone").html(previewResult);

        previewButton.setDisabled(false); // 恢复预览按钮使用
    });

    // 执行发送
    submitButton.on("click", async () => {
        const confirm = await OO.ui.confirm($("<p>请确认您要发送的内容是否有误。若因输入不当而产生错误，请自行<ruby><rb>承担后果</rb><rp>(</rp><rt>料理后事</rt><rp>)</rp></ruby>。</p>"), {
            title: "提醒",
            size: "small",
        });
        if (confirm) {
            submitButton.setDisabled(true);
            previewButton.setDisabled(true);
            window.onbeforeunload = () => true;
            $("#mw-content-text input, #mw-content-text textarea").prop("disabled", true);

            const pageList = [...new Set(pagelistBox.getValue().split("\n").filter((s) => s && s.trim()))]; // 页面列表，分割、删空、去重
            const sectiontitle = headlineBox.getValue().trim(); // 章节标题
            const text = contentBox.getValue().trim(); // 文本内容
            const interval = Number(intervalBox.getValue()) * 1000; // 发送间隔
            const summary = summaryBox.getValue(); // 编辑摘要

            // 输入检查
            if (pageList.length === 0) {
                record("请输入要发送的目标页面。", "warn");
                $("#state-warn").text(++warnCount);
                return;
            } else if (sectiontitle.length === 0) {
                record("请输入章节标题。", "warn");
                $("#state-warn").text(++warnCount);
                return;
            } else if (text.length === 0) {
                record("请输入内容。", "warn");
                $("#state-warn").text(++warnCount);
                return;
            }

            for (const item of pageList) {
                const title = item.replace(/^ *(?:User[_ ]talk:|用[户戶][讨討][论論]:|使用者[讨討][论論]:|U:|User:|用[户戶]:)?(.*)$/i, "User_talk:$1");
                let sendResult;
                try {
                    sendResult = await send(title, sectiontitle, text, summary);
                    if (sendResult.edit?.result === "Success") {
                        record(`向【<a href="/${title}">${title}</a>】发送成功。`);
                        $("#state-success").text(++successCount);
                        await waitInterval(interval);
                    } else if (sendResult.edit?.result === "Failure") {
                        record(`向【<a href="/${title}">${title}</a>】发送失败：${Object.keys(sendResult.edit)[0]}：${sendResult.edit[Object.keys(sendResult.edit)[0]]}。`, "error");
                        $("#state-error").text(++errorCount);
                    }
                } catch (err) {
                    record(`向【<a href="/${title}">${title}</a>】发送失败：${err}。`, "error");
                    $("#state-error").text(++errorCount);
                }
            }

            record("发送完毕。");
            submitButton.setDisabled(false);
            previewButton.setDisabled(false);
            window.onbeforeunload = () => null;
            $("#mw-content-text input, #mw-content-text textarea").prop("disabled", false);
        }
    });
})());

/**
 * </pre>
 */