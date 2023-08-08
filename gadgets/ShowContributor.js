// eslint-disable-next-line
var _addText = '{{Documentation|content=本小工具用于在主、模板、分类、帮助、模块名字空间快速列出本页贡献者。\n\n根据二饼所提的想法随手写的，不保修、不保好看、不保加功能。\n\n使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码<pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("/index.php?title=User:BearBin/js/ShowContributors.js&action=raw&ctype=text/javascript");</pre>}}';

"use strict";
$(() => (async () => {
    if([0, 10, 12, 14, 828].includes(mw.config.get("wgNamespaceNumber"))) {
        await mw.loader.using(["mediawiki.api", "oojs-ui-core"]);
        const api = new mw.Api();

        const ShowContributors = $('<div id="contributors"></div>');
        const contriButton = new OO.ui.ButtonWidget({
            label: "本页贡献者",
            icon: "search",
            flags: "progressive",
            id: "contributor-button",
        });
        const contributorList = $('<ul id="contributor-list"></ul>').hide();
        ShowContributors
            .append(contriButton.$element)
            .append(contributorList);
        mw.loader.addStyleTag(`
            #firstHeading {
                margin-bottom: 0;
            }
            #mw-body-container #moe-article-header-container {
                padding-bottom: 0;
            }
            #contributors {
                display: flex;
                align-items: center;
                justify-content: flex-end;
            }
            body.skin-vector #contributors {
                border-bottom: 1px solid rgba(0, 0, 0, .2);
            }
            body.skin-moeskin #contributors {
                border-top: 1px solid rgba(0, 0, 0, .1);
            }
            #contributor-button {
                margin: 0;
            }
            #contributors>div {
                font-weight: 700;
                padding: 0 .4em;
                white-space: nowrap;
            }
            #contributor-list {
                display: flex;
                max-width: 100%;
                overflow-x: auto;
                margin: 0;
                position: relative;
            }
            #contributor-list::-webkit-scrollbar {
                height: 10px;
            }
            #contributor-list::-webkit-scrollbar-button {
                display: none;
            }
            #contributor-list::-webkit-scrollbar-thumb {
                border: 2px solid transparent;
                border-radius: 15px;
                background-clip: content-box;
                box-shadow: inset 0 0 0 20px rgba(127, 127, 127, .7);
            }
            #contributor-list li,
            #contributor-list a {
                display: flex;
                align-items: center;
            }
            #contributor-list img {
                max-width: initial;
                width: 32px;
                border-radius: 50%;
            }
            #contributor-list::before,
            #contributor-list::after {
                content: "\\00a0";
                flex: 0 0 20px;
                background-repeat: no-repeat;
                background-position: center;
                position: sticky;
                background-color: #FFF;
            }
            #contributor-list::before {
                background-image: linear-gradient(transparent,transparent),url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22%3E%3Ctitle%3Eprevious%3C/title%3E%3Cpath d=%22M4.8 10l9 9 1.4-1.5L7.8 10l7.4-7.5L13.8 1z%22/%3E%3C/svg%3E");
                left: 0;
            }
            #contributor-list::after {
                background-image: linear-gradient(transparent,transparent),url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22%3E%3Ctitle%3Enext%3C/title%3E%3Cpath d=%22M6.2 1L4.8 2.5l7.4 7.5-7.4 7.5L6.2 19l9-9z%22/%3E%3C/svg%3E");
                right: 0;
            }
            #contributors,
            #contributors .oo-ui-labelElement-label {
                font-size: 1rem;
            }
        `);

        switch(mw.config.get("skin")) {
            case "moeskin":
                $("#moe-article-header-title").after(ShowContributors);
                break;
            case "vector":
                $("#firstHeading").after(ShowContributors);
                break;
        }

        // 考虑弄一个长按滚动
        const nextPress = setInterval(() => {

        }, 100);


        contriButton.on("click", async () => {
            $("#contributor-button a").addClass("oo-ui-pendingElement-pending");
            // 应该没有页面超过500个编辑者吧，暂时不管这个问题
            const contriData = await api.get({
                action: "query",
                prop: "contributors",
                titles: mw.config.get("wgPageName"),
                pcexcludegroup: "bot",
                pclimit: "max",
            });
            for (const item of Object.values(contriData.query.pages)[0].contributors) {
                const listItem = $("<li></li>");
                listItem.html(`<a href="/User:${item.name}" title="${item.name}"><img src="//commons.moegirl.org.cn/extensions/Avatar/avatar.php?user=${item.name}&res=128" /></a>`);
                contributorList.append(listItem);
            }
            contributorList.show();
            ShowContributors.prepend("<div>本页贡献者</div>");
            contriButton.$element.remove();
        });

        $("#contributor-list::before").on("mousedown", (e) => {
            e.preventDefault();
        });
        $("#contributor-list::after").on("mousedown", (e) => {
            e.preventDefault();
        });
    }
})());