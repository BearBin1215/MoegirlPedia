"use strict";
if (mw.config.get("wgCanonicalSpecialPageName") === "Whatlinkshere") {
    $("#mw-content-text>p>strong").after($("<a>[复制列表]</a>").on("click", function (e) {
        var linkList = [];
        $("#mw-whatlinkshere-list>li>a").each(function (_, ele) {
            linkList.push($(ele).text());
        });
        navigator.clipboard.writeText(linkList.join("\n")).then(function () {
            $(e.target).text("[复制成功]");
            setTimeout(function () { return $(e.target).text("[复制列表]"); }, 3000);
        }, function (err) {
            $(e.target).text("[\u590D\u5236\u5931\u8D25\uFF1A".concat(err, "]"));
            setTimeout(function () { return $(e.target).text("[复制列表]"); }, 3000);
        });
    }).css("padding-left", ".6em"));
}
