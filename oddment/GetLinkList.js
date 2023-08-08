"use strict";
if(mw.config.get("wgCanonicalSpecialPageName") === "Whatlinkshere") {
    $("#mw-content-text>p>strong").after($("<a>[复制列表]</a>").on("click", (e) => {
        const linkList = [];
        $("#mw-whatlinkshere-list>li>a").each((_, ele) => {
            linkList.push($(ele).text());
        });
        navigator.clipboard.writeText(linkList.join("\n")).then(() => {
            $(e.target).text("[复制成功]");
            setTimeout(() => $(e.target).text("[复制列表]"), 3000);
        }, (err) => {
            $(e.target).text(`[复制失败：${err}]`);
            setTimeout(() => $(e.target).text("[复制列表]"), 3000);
        });
    }).css("padding-left", ".6em"));
}