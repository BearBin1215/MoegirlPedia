"use strict";
if (mw.config.get("wgAction") === "history" && document.getElementById("ca-edit")) {
    $("#pagehistory>li:not(:first-child)").each(function (num, ele) {
        var oldid = $(ele).attr("data-mw-revid");
        var wgScript = mw.config.get("wgScript");
        $(ele)
            .children(".mw-history-undo")
            .children("a:first-child")
            .after(" | <a title=\"\u7F16\u8F91\u81EA\u6B64\u7248\u672C\" href=\"".concat(wgScript, "?action=edit&oldid=").concat(oldid, "&summary=\u7F16\u8F91\u81EA[[Special:Permanentlink/").concat(oldid, "|\u7248\u672C").concat(oldid, "]]\">\u7F16\u8F91</a>"));
        if (num === $("#pagehistory>li:not(:first-child)").length - 1) {
            $(ele).append("\uFF08<span class=\"mw-history-undo\"><a title=\"\u7F16\u8F91\u81EA\u6B64\u7248\u672C\" href=\"".concat(wgScript, "?action=edit&oldid=").concat(oldid, "&summary=\u7F16\u8F91\u81EA[[Special:Permanentlink/").concat(oldid, "|\u7248\u672C").concat(oldid, "]]\">\u7F16\u8F91</a></span>\uFF09"));
        }
    });
}
