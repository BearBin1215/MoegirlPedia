/**
 * @description 递归查找分类内的所有子分类
 * 
 * @todo 嵌套检测
 */

// <pre>
// eslint-disable-next-line
var _addText = '{{Documentation|content=本小工具用于快速递归查询某分类下的所有子分类。\n\n使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码\n<pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("/index.php?title=User:BearBin/js/Cat-in-Tree.js&action=raw&ctype=text/javascript");</pre>}}';

"use strict";
$(() => (async () => {
    if (mw.config.get("wgNamespaceNumber") === 14) {
        await mw.loader.using(["mediawiki.api", "mediawiki.notification", "oojs-ui"]);

        const api = new mw.Api();
        const PAGENAME = mw.config.get("wgPageName");
        let treeList = []; // 用于记录单次从顶至底查找的内容，检测分类嵌套。
        let level = 0;
        let maxLevel = 0;

        $("head").append(`<style>
            #cit-level-select {
                display: inline-block;
                width: 8em;
            }
            #cit-divider {
                margin: 1em 0;
            }
        </style>`);

        const CiTSearch = new OO.ui.ButtonWidget({
            label: "递归列出子分类",
            flags: "progressive",
            icon: "search",
            id: "cit-search",
        });
        $("#mw-content-text").append(
            '<hr id="cit-divider" />',
            CiTSearch.$element,
        );
        $("#cit-search").after('<div id="cit-list"></div>');

        const CiTMuilticol = new OO.ui.ButtonWidget({
            label: "分列显示",
            flags: "progressive",
            id: "cit-multicol",
        });
        CiTMuilticol.$element.insertAfter(CiTSearch.$element).hide();

        // 递归查询并列出页面列表
        const getSubCat = async (cmtitle, $node) => {
            let cmcontinue = "";
            const catList = [];
            if(level === 1) {
                treeList = []; // 每次回到顶部刷新记录列表
            }
            while (cmcontinue !== false) {
                const subCats = await api.get({
                    action: "query",
                    list: "categorymembers",
                    cmtype: "subcat",
                    cmlimit: "max",
                    cmtitle,
                    cmcontinue,
                });
                cmcontinue = subCats.continue ? subCats.continue.cmcontinue : false;
                
                for (const item of subCats.query.categorymembers) {
                    /*
                    if(treeList.includes(item.title)) {
                        throw `${cmtitle}处出现嵌套分类。`;
                    }*/
                    catList.push(item.title);
                    treeList.push(item.title);
                }
            }

            if(catList.length > 0) {
                const ul = $("<ul></ul>");
                $node.append(ul);
                for(const cat of catList) {
                    console.log(level);
                    level++;
                    maxLevel = Math.max(maxLevel, level);
                    const catitem = $(`<li class="cit-level-${level}"><a href="/${cat}">${cat.replace("Category:", "")}</a></li>`);
                    ul.append(catitem);
                    await getSubCat(cat, catitem);
                    level--;
                }
            }
        };

        // 搜索
        CiTSearch.on("click", async () => {
            // 移除上次搜索的内容（如果有）
            level = 0;
            maxLevel = 0;
            $("#cit-level-select").remove();
            $("#cit-list").html("");

            // 进入加载状态，显示分列按钮
            $("#cit-search a").addClass("oo-ui-pendingElement-pending");
            CiTMuilticol.$element.show();
            try {
                await getSubCat(PAGENAME, $("#cit-list"));
            } catch(e) {
                OO.ui.alert(e, {
                    title: "遇到错误",
                    size: "small",
                });
            }
            $("#cit-search a").removeClass("oo-ui-pendingElement-pending"); // 查询完成
            mw.notify("查询完毕");

            // 用户选择显示层级。
            // 非常笨的实现方法，欢迎提出好建议
            const options = [{data: "all", label: "显示所有"}];
            for (let i = 1; i <= maxLevel; i++) {
                options.push({data: i, label: `显示${i}级`});
            }
            const CitLevelSelect = new OO.ui.DropdownInputWidget({
                options,
                id: "cit-level-select",
            });
            CitLevelSelect.$element.insertAfter(CiTMuilticol.$element);
            CitLevelSelect.on("change", () => {
                const showLevel = CitLevelSelect.getValue();
                if(showLevel === "all") {
                    for (let i = 1; i <= maxLevel; i++) {
                        $(`.cit-level-${i}`).show();
                    }
                } else {
                    for (let i = 1; i <= Number(showLevel); i++) {
                        $(`.cit-level-${i}`).show();
                    }
                    $(`.cit-level-${Number(showLevel)+1}`).hide();
                }
            });
        });

        // 分列显示按钮
        let multiList = false;
        CiTMuilticol.on("click", () => {
            if(multiList){
                $("#cit-list").removeClass("mw-category");
                $("#cit-multicol .oo-ui-labelElement-label").text("分列显示");
            } else {
                $("#cit-list").addClass("mw-category");
                $("#cit-multicol .oo-ui-labelElement-label").text("关闭分列显示");
            }
            multiList = !multiList;
        });
    }
})());

// </pre>