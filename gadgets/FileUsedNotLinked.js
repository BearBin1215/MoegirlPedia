/**
 * @description 查询文件非链入使用。
 * 
 * @todo 标记时跳出窗口可选输入用途
 */

// eslint-disable-next-line strict, no-var
var _addText = '{{Documentation|content=本小工具用于快速查询共享站文件非链入使用。\n== 使用 ==\n在[[cm:Special:MyPage/common.js|你的共享站个人js页]]添加如下代码\n<pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("https://mobile.moegirl.org.cn/index.php?title=User:BearBin/js/FileUsedNotLinked.js&action=raw&ctype=text/javascript");</pre>\n打开任意文件页面后即可使用。\n\n== 功能 ==\n=== 查询 ===\n进入文件页面后，在下方的“文件用途”章节会显示按钮：\n\n<span class="oo-ui-widget-enabled oo-ui-buttonElement oo-ui-buttonElement-framed oo-ui-iconElement oo-ui-labelElement oo-ui-flaggedElement-progressive oo-ui-buttonWidget"><span class="oo-ui-buttonElement-button"><span class="oo-ui-iconElement-icon oo-ui-icon-search oo-ui-image-progressive"></span><span class="oo-ui-labelElement-label">查询非链入使用</span><span class="oo-ui-indicatorElement-indicator oo-ui-image-progressive"></span></span></span>\n\n点击后，小工具将自动获取非链入使用了此文件的页面并列出。\n=== 标记 ===\n若查询到文件有使用但非链入，则会在查询按钮右侧显示另一个标记非链入使用的按钮：\n\n<span class="oo-ui-widget-enabled oo-ui-buttonElement oo-ui-buttonElement-framed oo-ui-iconElement oo-ui-labelElement oo-ui-flaggedElement-progressive oo-ui-buttonWidget"><span class="oo-ui-buttonElement-button"><span class="oo-ui-iconElement-icon oo-ui-icon-search oo-ui-image-progressive"></span><span class="oo-ui-labelElement-label">查询非链入使用</span><span class="oo-ui-indicatorElement-indicator oo-ui-image-progressive"></span></span></span><span class="oo-ui-widget-enabled oo-ui-buttonElement oo-ui-buttonElement-framed oo-ui-iconElement oo-ui-labelElement oo-ui-flaggedElement-progressive oo-ui-buttonWidget"><span class="oo-ui-buttonElement-button"><span class="oo-ui-iconElement-icon oo-ui-icon-tag oo-ui-image-progressive"></span><span class="oo-ui-labelElement-label">标记非链入使用</span><span class="oo-ui-indicatorElement-indicator oo-ui-image-progressive"></span></span></span>\n\n点击标记按钮后，小工具将会根据搜索出来的结果，自动给文件页面添加&#123;&#123;[[cm:Template:非链入使用|非链入使用]]&#125;&#125;。\n=== 移除标记 ===\n若没有查询到非链入使用，但页面内却已经悬挂了&#123;&#123;[[cm:Template:非链入使用|非链入使用]]&#125;&#125;，则会出现另一个移除非链入使用模板的按钮：\n\n<span class="oo-ui-widget-enabled oo-ui-buttonElement oo-ui-buttonElement-framed oo-ui-iconElement oo-ui-labelElement oo-ui-flaggedElement-progressive oo-ui-buttonWidget"><span class="oo-ui-buttonElement-button"><span class="oo-ui-iconElement-icon oo-ui-icon-search oo-ui-image-progressive"></span><span class="oo-ui-labelElement-label">查询非链入使用</span><span class="oo-ui-indicatorElement-indicator oo-ui-image-progressive"></span></span></span><span class="oo-ui-widget-enabled oo-ui-buttonElement oo-ui-buttonElement-framed oo-ui-iconElement oo-ui-labelElement oo-ui-flaggedElement-progressive oo-ui-buttonWidget"><span class="oo-ui-buttonElement-button"><span class="oo-ui-iconElement-icon oo-ui-icon-tag oo-ui-image-progressive"></span><span class="oo-ui-labelElement-label">移除非链入标记</span><span class="oo-ui-indicatorElement-indicator oo-ui-image-progressive"></span></span></span>\n\n点击按钮将会自动移除此文件的非链入使用模板。}}';

"use strict";
$(() => (async () => {
    // 本来想做一个检测当前页面文件存在不存在的，但想了想没啥必要。
    if (mw.config.get("wgNamespaceNumber") === 6) {
        await mw.loader.using(["mediawiki.api", "mediawiki.ForeignApi", "mediawiki.notification", "oojs-ui"]);
        const api = new mw.Api();
        const zhmoeApi = new mw.ForeignApi("https://mobile.moegirl.org.cn/api.php", { anonymous: true });
        const FILENAME = mw.config.get("wgTitle");
        const PAGENAME = mw.config.get("wgPageName");

        let pageList = [];

        // 重定向页面和其他页面元素有所区别，分别处理
        if(mw.config.get("wgIsRedirect")) {
            $(".redirectMsg").after('<hr/><div id="funl-note">请注意：对过短的文件名使用本工具可能会出现误判，建议手动检查。</div>');
        } else {
            $("#filelinks").after('<div id="funl-note">请注意：对过短的文件名使用本工具可能会出现误判，建议手动检查。</div>');
        }
        // 搜索按钮
        const searchButton = new OO.ui.ButtonWidget({
            label: "查询非链入使用",
            flags: "progressive",
            icon: "search",
            id: "search-submit-button",
        });
        $("#funl-note").after(searchButton.$element);

        // 标记非链入使用按钮
        const markButton = new OO.ui.ButtonWidget({
            label: "标记非链入使用",
            flags: "progressive",
            icon: "tag",
            id: "add-mark-button",
        });
        searchButton.$element.after(markButton.$element);

        // 移除非链入使用标记按钮
        const removeButton = new OO.ui.ButtonWidget({
            label: "移除非链入标记",
            flags: "progressive",
            icon: "tag",
            id: "remove-mark-button",
        });
        markButton.$element.after(removeButton.$element);

        markButton.$element.hide();
        removeButton.$element.hide();
        removeButton.$element.after(
            '<div id="search-result" style="margin:.6em 0">' +
            '<div id="result-overview"></div>' +
            '<ul id="result-list"></ul>' +
            "</div>" +
            "<hr/>",
        );

        /**
         * 直接在页面内获取链入使用的列表
         * 最多获取50个，但多于50个的文件根本不需要使用此工具，所以不用考虑这个问题
         * @returns 页面列表
         */
        const usedLinked = () => {
            const pageList = [];
            for (const item of $(".mw-gu-onwiki-zh_moegirl_org_cn").find("a")) {
                pageList.push(item.text);
            }
            return pageList;
        };

        // 搜索
        const searchInSource = async () => {
            // 需要分别搜索未编码和编码后的文件名
            const decodeSearchResult = await zhmoeApi.get({
                action: "query",
                list: "search",
                srnamespace: "0|4|10|12|14|274|828",
                srwhat: "text",
                srsearch: `insource:"${FILENAME.replaceAll('"', " ")}"`, // 文件名可能带有半角双引号，和insource的引号混淆，要替换掉
            });
            const encodeSearchResult = await zhmoeApi.get({
                action: "query",
                list: "search",
                srnamespace: "0|4|10|12|14|274|828",
                srwhat: "text",
                srsearch: `insource:"${encodeURI(FILENAME).replaceAll('"', " ").replaceAll("%20", " ")}"`,
            });

            const notLinkedList = [];
            [...encodeSearchResult.query.search, ...decodeSearchResult.query.search].forEach((item) => {
                // 通过搜索结果的快照，检查搜索文本内是否有此文件名，用于解决大小写敏感问题
                // 但文件名中的符号可能会影响<span class="searchmatch">的位置插到文件名中间，因此要去掉这对标签
                const snippetTemp = item.snippet.replaceAll("_", " ").replaceAll("<span class=\"searchmatch\">", "").replaceAll("</span>", "");
                if(
                    snippetTemp.includes(FILENAME.replaceAll("_", " ")) ||
                    snippetTemp.includes(encodeURI(FILENAME.replaceAll("_", " "))) ||
                    snippetTemp.includes(encodeURI(FILENAME.replaceAll("_", " ")).replaceAll("%20", " "))
                ) {
                    notLinkedList.push(item.title); // 合并两个搜索结果并得到页面列表
                }
            });

            // 排除链入使用的页面
            const used = new Set([...usedLinked()]);
            let pageList = notLinkedList.filter((x) => !used.has(x));

            if (pageList.length === 0) {
                $("#result-overview").text("zh站没有查找到非链入使用此文件的页面。");
                return [];
            }
            $("#result-overview").text("文件在以下页面以非内链形式使用：");

            pageList = [...new Set(pageList)];
            for (const item of pageList) {
                $("#result-list").append(`<li><a href="https://zh.moegirl.org.cn/${item}">zhmoe:${item}</a></li>`);
            }
            $("#search-submit-button a").removeClass("oo-ui-pendingElement-pending");
            return pageList;
        };

        /**
         * 添加[[T:非链入使用]]
         */
        const addMark = async () => {
            mw.notify("正在标记……");
            $("#add-mark-button a").addClass("oo-ui-pendingElement-pending");
            const linkList = `[[zhmoe:${pageList.join("]]、[[zhmoe:")}]]`; // 将页面列表写为[[zhmoe:A]]、[[zhmoe:B]]、[[zhmoe:C]]……的形式
            try {
                await api.postWithToken("csrf", {
                    format: "json",
                    action: "edit",
                    watchlist: "nochange",
                    tags: "Automation tool",
                    minor: true,
                    title: PAGENAME,
                    appendtext: `{{非链入使用|${linkList}}}`,
                    summary: "标记非链入使用的文件",
                }).done(() => {
                    mw.notify("标记成功！将在2秒后刷新……");
                    $("#add-mark-button a").removeClass("oo-ui-pendingElement-pending");
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                });
            } catch(err) {
                mw.notify(`标记失败：${err}`, "error");
            }
        };

        /**
         * 移除[[T:非链入使用]]
         */
        const removeMark = async () => {
            mw.notify("正在移除标记……");
            $("#remove-mark-button a").addClass("oo-ui-pendingElement-pending");
            try {
                let pageSource = await api.get({
                    action: "parse",
                    format: "json",
                    page: PAGENAME,
                    prop: "wikitext",
                });
                pageSource = pageSource.parse.wikitext["*"];
                const replacedSource = pageSource.replace(/\{\{非链入使用\|[^{}]*\}\}/g, ""); // 移除非链入使用模板
                await api.postWithToken("csrf", {
                    format: "json",
                    action: "edit",
                    watchlist: "nochange",
                    tags: "Automation tool",
                    minor: true,
                    nocreate: true,
                    title: PAGENAME,
                    text: replacedSource,
                    summary: "移除非链入使用标记",
                }).done(() => {
                    mw.notify("移除成功！将在2秒后刷新……");
                    $("#remove-mark-button a").removeClass("oo-ui-pendingElement-pending");
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                });
            } catch(err) {
                mw.notify(`移除失败：${err}`, "error");
            }
        };

        // 执行体
        searchButton.on("click", async () => {
            mw.notify("正在查询……");
            $("#search-submit-button a").addClass("oo-ui-pendingElement-pending");
            pageList = await searchInSource();
            if (pageList.length > 0 && $(".used-not-linked").length === 0) {
                markButton.$element.show();
            } else if (pageList.length === 0 && $(".used-not-linked").length > 0) {
                removeButton.$element.show();
            }
            mw.notify("查询完毕");
            $("#search-submit-button a").removeClass("oo-ui-pendingElement-pending");
        });
        markButton.on("click", async () => {
            await addMark();
        });
        removeButton.on("click", async () => {
            await removeMark();
        });
    }
})());