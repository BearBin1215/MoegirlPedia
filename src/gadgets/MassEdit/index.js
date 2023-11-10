import "./index.less";

$(() => (async () => {
    if (!["special:massedit", "special:批量编辑", "special:批量編輯"].includes(mw.config.get("wgPageName").toLowerCase())) {
        await mw.loader.using("mediawiki.util");
        mw.util.addPortletLink("p-tb", "/Special:MassEdit", "批量编辑", "t-massedit");
        return;
    }
    await mw.loader.using(["mediawiki.api", "oojs-ui"]);
    const api = new mw.Api();
    mw.loader.load("https://mobile.moegirl.org.cn/index.php?title=User:Nzh21/js/QuickDiff.js&action=raw&ctype=text/javascript");
    const tags = mw.config.get("wgUserGroups").includes("bot") ? "bot" : "Automation tool";
    let successCount = 0;
    let nochangeCount = 0;
    let errorCount = 0;
    let warnCount = 0;
    let length = 0;

    /**
     * 在Special:MassEdit构建页面
     */
    mw.config.set("wgCanonicalSpecialPageName", "MassEdit");
    $("title").text("批量编辑 - 萌娘百科_万物皆可萌的百科全书");
    $(".mw-invalidspecialpage").removeClass("mw-invalidspecialpage");
    $("#firstHeading").html('批量编辑页面<div>By <a href="/User:BearBin">BearBin</a></div>');
    $("#contentSub").remove();
    $("#mw-content-text").html([
        '<h5>原文字：</h5>',
        '<textarea id="me-edit-from" name="me-edit-from" rows="4"></textarea>',
        '<h5>替换为：</h5>',
        '<textarea id="me-change-to" name="me-change-to" rows="4"></textarea>',
        '<div id="me-regex"></div>',
        '<ul id="me-regex-note">',
        '<li>正则表达式须使用斜线包裹（如<code>/regex/g</code>），且<code>g</code>为必须，否则无法被js解析。</li>',
        '<li>替换后文本若有换行请直接敲回车，不要用<code>\\n</code>。</li>',
        '</ul>',
        '<div id="me-page-lists">',
        '<div>',
        '<h5>页面</h5>',
        '<textarea id="me-page-list" name="me-page-list" rows="12"></textarea>',
        '</div>',
        '<div>',
        '<h5>分类</h5>',
        '<textarea id="me-category-list" name="me-category-list" rows="12"></textarea>',
        '</div>',
        '</div>',
        '<div id="me-pages-note">输入要编辑的页面或分类，<u>每行一个</u>；分类栏请带上 分类/Category/Cat 等能被系统识别的分类名字空间前缀。</div>',
        '<div id="me-edit-panel"></div>',
        '<ul id="me-submit-note">',
        '<li>编辑间隔单位为秒（s），不填默认为0。不包含本身编辑页面所用的时间。</li>',
        '<li>请注意<a target="_blank" href="/萌娘百科:机器用户">机器用户方针</a>所规定速率和<a target="_blank" href="/api.php?action=query&meta=userinfo&uiprop=ratelimits">ratelimit限制</a>并自行设置间隔，或申请机器用户权限。</li>',
        '</ul>',
        '<h5 id="bearbintools-log-title">日志<a id="bearbintools-log-clear">[清空]</a></h5>',
        '<div id="bearbintools-log">',
        '<div id="bearbintools-log-state">',
        '<div class="log-success log-selected" id="log-success"><span class="state">✓</span><span id="state-success">0</span> 已完成</div>',
        '<div class="log-nochange log-selected" id="log-nochange"><span class="state">○</span><span id="state-nochange">0</span> 无变化</div>',
        '<div class="log-error log-selected" id="log-error"><span class="state">✕</span><span id="state-error">0</span> 出错</div>',
        '<div class="log-warn log-selected" id="log-warn"><span class="state">!</span><span id="state-warn">0</span> 警告</div>',
        '</div>',
        '<ul id="bearbintools-log-lines"></ul>',
        '</div>',
        '<ul id="bearbintools-log-note">',
        '<li>报错“http”不一定是编辑失败，可能实际已提交但等待成功信息过久而判定超时。</li>',
        '</ul>',
    ].join(""));
    const regexSelect = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
        value: "regex",
        id: "me-regex-box",
    }), {
        label: "使用正则表达式",
        align: "inline",
        id: "me-use-regex",
    });
    const regexHelp = new OO.ui.ButtonWidget({
        label: "常用正则",
        icon: "help",
        id: "me-regex-help",
    });
    $("#me-regex").append(regexSelect.$element, regexHelp.$element);
    const submitButton = new OO.ui.ButtonWidget({
        label: "提交",
        flags: [
            "primary",
            "progressive",
        ],
        icon: "check",
        id: "me-submit",
    });
    const intervalBox = new OO.ui.TextInputWidget({
        placeholder: "编辑间隔",
        id: "me-interval",
    });
    const summaryBox = new OO.ui.TextInputWidget({
        placeholder: "附加摘要",
        id: "me-summary",
    });
    $("#me-edit-panel").append(
        submitButton.$element,
        intervalBox.$element,
        summaryBox.$element,
    );

    /**
     * 实现sleep效果，使用时需要加上await
     * 
     * @param {number} time 等待时间（ms）
     * @returns {Promise<void>}
     */
    const waitInterval = (time) => new Promise((resolve) => setTimeout(resolve, time));

    /**
     * 记录编辑日志
     * 
     * @param {string} info 日志内容
     * @param {string} type 日志类型，normal/success/nochange/warn/error
     */
    const record = (info, type = "normal") => {
        $("#bearbintools-log-lines").append(`<li class="log-${type}">${new Date().toLocaleTimeString()} - ${info}</li>`);
        const message = document.getElementById("bearbintools-log-lines");
        message.scrollTop = message.scrollHeight;
    };

    /**
     * 获取用户输入的页面或分类
     * 
     * 经测试postWithToken()会自动去掉title的首尾空格，不需要另外去除。
     * 
     * @param {string} type "page"或"category"
     * @returns {string[]} 页面列表
     */
    const getList = (type) => $(`#me-${type}-list`).val().split("\n").filter((s) => s && s.trim());

    /**
     * 获取分类列表内的页面
     * 
     * @param {string[]} categories 分类列表
     * @returns {Promise<string[]>} 分类内的页面
     */
    const getPagesFromCats = async (categories) => {
        const pageList = [];
        const promises = categories.map(async (category) => {
            let cmcontinue = "";
            while (cmcontinue !== undefined) {
                try {
                    const result = await api.get({
                        action: "query",
                        list: "categorymembers",
                        cmlimit: "max",
                        cmtitle: category,
                        cmcontinue,
                    });
                    if (result.query.categorymembers[0]) {
                        for (const page of result.query.categorymembers) {
                            pageList.push(page.title);
                        }
                    }
                    cmcontinue = result.continue?.cmcontinue;
                    if (result.query.categorymembers.length > 0) {
                        record(`获取到【<a href="/${category}" target="_blank">${category}</a>】内的页面${result.query.categorymembers.length}个。`, "normal");
                    } else {
                        record(`【${category}】内没有页面。`, "warn");
                    }
                } catch (error) {
                    let message = "";
                    switch (error) {
                        case "http":
                            message = "网络连接出错";
                            break;
                        default:
                            message = error;
                    }
                    record(`获取【${category}】内的页面出错：${message}。`, "error");
                    break;
                }
            }
        });
        await Promise.all(promises);
        return [...new Set(pageList)];
    };

    /**
     * 根据用户输入获取最终要编辑的页面列表
     * 
     * @returns {Promise<string[]>} 得到的页面列表
     */
    const getPageList = async () => {
        const pageSet = new Set([...getList("page"), ...await getPagesFromCats(getList("category"))]);
        return [...pageSet];
    };

    // 获取间隔
    const getInterval = () => Number(intervalBox.getValue()) * 1000;

    // 获取附加摘要
    const getAdditionalSummary = () => summaryBox.getValue();

    /**
     * 根据替换规则对指定页面进行编辑
     * 
     * @param {string} title 页面标题
     * @param {string} summary 编辑摘要
     * @param {string|RegExp} editFrom 原文字
     * @param {string} changeTo 替换为 
     * @returns {Promise<"nochange"|"success"|"failed">} 编辑结果，success/nochange/failed
     */
    const editAction = async (title, summary, editFrom, changeTo) => {
        try {
            let source = await api.get({
                action: "parse",
                format: "json",
                page: title,
                prop: "wikitext",
            });
            source = source.parse.wikitext["*"]; // 获取源代码并进行替换
            const replacedSource = source.replaceAll(editFrom, changeTo);
            if (source === replacedSource) {
                record(`【<a href="/${title}" target="_blank">${title}</a>】编辑前后无变化。`, "nochange");
                $("#state-nochange").text(++nochangeCount);
                return "nochange";
            }
            const editResult = await api.postWithToken("csrf", {
                format: "json",
                action: "edit",
                watchlist: "nochange",
                tags,
                bot: true,
                minor: true,
                nocreate: true,
                title,
                text: replacedSource,
                summary: `[[U:BearBin/js#MassEdit|MassEdit]]：【${editFrom}】→【${changeTo}】${summary === "" ? "" : `：${summary}`}`,
            });
            record(`【<a href="/_?diff=${editResult.edit.newrevid}" target="_blank">${title}</a>】编辑完成。`, "success");
            $("#state-success").text(++successCount);
            return "success";
        } catch (err) {
            let errorMessage = "";
            switch (err) {
                case "missingtitle":
                    errorMessage = "页面不存在";
                    break;
                case "http":
                    errorMessage = "网络连接出错";
                    break;
                case "protectedpage":
                    errorMessage = "页面被保护";
                    break;
                default:
                    errorMessage = err;
            }
            record(`编辑【<a href="/${title}?action=history" target="_blank">${title}</a>】时出现错误：${errorMessage}。`, "error");
            $("#state-error").text(++errorCount);
            return "failed";
        }
    };

    // 执行体
    submitButton.on("click", async () => {
        const confirmText = $("<p>请确认您的编辑内容。若因输入不当而产生错误，请自行<ruby><rb>承担后果</rb><rp>(</rp><rt>料理后事</rt><rp>)</rp></ruby>。</p>");
        const confirm = await OO.ui.confirm(confirmText, {
            title: "提醒",
            size: "small",
        });
        if (confirm) {
            // 检查输入
            if ($("#me-edit-from").val() === "") {
                record("请输入要替换的原文字。", "warn");
                $("#state-warn").text(++warnCount);
            } else if ($("#me-page-list").val() === "" && $("#me-category-list").val() === "") {
                record("请输入要编辑的页面或分类。", "warn");
                $("#state-warn").text(++warnCount);
            } else {
                const additionalSummary = getAdditionalSummary();
                const interval = getInterval();
                const changeTo = $("#me-change-to").val();
                let editFrom = $("#me-edit-from").val();
                // 解析正则表达式
                if ($("#me-regex-box input").prop("checked")) {
                    try {
                        if (!/\/[\s\S]+\//.test(editFrom)) {
                            record("正则表达式有误。");
                            return;
                        }
                        editFrom = eval(editFrom);
                    } catch (err) {
                        record(`正则表达式解析失败：${err}`, "error");
                        return;
                    }
                }
                submitButton.setDisabled(true);
                $("#mw-content-text input, #mw-content-text textarea").prop("disabled", true);
                window.onbeforeunload = () => true; // 执行过程中关闭标签页，发出提醒
                await getPageList().then(async (result) => {
                    let complete = 0;
                    // console.log(`页面列表：${result}`);
                    length = result.length;
                    record(`共${length}个页面，即将开始编辑……`, "normal");
                    for (const item of result) {
                        const editResult = await editAction(item, additionalSummary, editFrom, changeTo);
                        complete++;
                        if (editResult === "success" && interval !== 0 && complete < length) {
                            await waitInterval(interval);
                        }
                    }
                    record("编辑完毕。", "normal");
                });
                submitButton.setDisabled(false);
                $("#mw-content-text input, #mw-content-text textarea").prop("disabled", false);
                window.onbeforeunload = () => null;
            }
        }
    });

    // 正则帮助
    const regexHelpText = $('<ul id="me-regex-help-list"></ul>').append(
        `<li><code>${/\[\[(?:Category|Cat|分[类類]):分类名(\|[^[]*)?\]\]/gi.toString()}</code>：匹配分类</li>`,
        `<li><code>${/\{\{(?:Template:|T:|[模样樣]板:)?模板名/gi.toString()}</code>：匹配模板（不含内容）</li>`,
        `<li><code>${/^.*$/gs.toString()}</code>：匹配全文（感谢鬼影）</li>`,
    );
    regexHelp.on("click", () => {
        OO.ui.alert(regexHelpText, {
            title: "常用正则表达式",
            size: "medium",
        });
    });

    // 清空日志
    $("#bearbintools-log-clear").on("click", () => {
        $("#bearbintools-log-lines").html("");
        $("#state-success, #state-nochange, #state-error, #state-warn").text(0);
        successCount = 0;
        nochangeCount = 0;
        errorCount = 0;
        warnCount = 0;
    });

    // 日志隐藏
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
})());