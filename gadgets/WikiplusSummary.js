// eslint-disable-next-line
var _addText = '{{Documentation|content=本小工具在[[User:妹空酱/Wikiplus|Wikiplus]]编辑框提供与wikieditor相似的快速填充摘要功能。\n\n使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码：\n<pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("/index.php?title=User:BearBin/js/WikiplusSummary.js&action=raw&ctype=text/javascript");</pre>\n加入后打开任意Wikiplus编辑框生效。}}';

"use strict";
$(() => {
    const WPSummary = window.WPSummary || [
        "修饰语句",
        "修正笔误",
        "内容扩充",
        "排版",
        "内部链接",
        "分类",
        "消歧义",
        "萌百化",
    ];

    // 点击快速编辑按钮，往编辑框添加按钮列
    $("body").on("click", "#Wikiplus-Edit-TopBtn, .Wikiplus-Edit-SectionBtn", () => {
        const itv = setInterval(() => {
            if (!document.getElementById("Wikiplus-Quickedit-Summary-Input")) {
                return;
            }
            clearInterval(itv);
            const $WSList = $("<div></div>", { id: "ws-buttons" }).css("margin-top", "0.2em");
            const $WSButtons = WPSummary.reduce((acc, val, index, arr) => {
                const $button = $(`<a>${val}</a>`);
                $button.on("click", () => {
                    const $summary = $("#Wikiplus-Quickedit-Summary-Input");
                    const summary = $summary.val();
                    $summary.val(summary.replace(/(\/\*.+\*\/ ?)?(.+)/, `$1${val} $2`))
                        .trigger("focus");
                });
                acc.push($button); // 逐一插入按钮
                if (index < arr.length - 1) {
                    acc.push($("<span> | </span>")); // 除最后一个外，插入分割线
                }
                return acc;
            }, []);
        
            $WSList.append(
                $("<span>摘要：</span>"),
                ...$WSButtons,
                "<br/>",
            );
            $("#Wikiplus-Quickedit-Summary-Input+br").replaceWith($WSList);
        }, 500);
    });
});