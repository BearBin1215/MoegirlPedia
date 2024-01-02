if (mw.config.get("wgAction") === "history" && document.getElementById("ca-edit")) {
    $("#pagehistory>li:not(:first-child)").each(function (num, ele) {
        var oldid = $(ele).attr("data-mw-revid");
        var wgScript = mw.config.get("wgScript");
        $(ele)
            .children(".mw-history-undo")
            .children("a:first-child")
            .after(' | <a title="编辑自此版本" href="' + wgScript + '?action=edit&oldid=' + oldid + '&summary=编辑自[[Special:Permanentlink/' + oldid + '|版本' + oldid + ']]">编辑</a>');
        if (num === $("#pagehistory>li:not(:first-child)").length - 1) {
            $(ele).append('（<span class="mw-history-undo"><a title="编辑自此版本" href="' + wgScript + '?action=edit&oldid=' + oldid + '&summary=编辑自[[Special:Permanentlink/' + oldid + '|版本' + oldid + ']]">编辑</a></span>）');
        }
    });
}