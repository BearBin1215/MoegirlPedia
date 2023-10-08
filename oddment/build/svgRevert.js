$('img[srcset*=".svg.png"]').each(function (_, ele) {
    if ($(ele).attr("srcset").indexOf("img.moegirl.org.cn/") > -1) {
        $(ele).attr("src", $(ele).attr("src").replaceAll("thumb/", "").replaceAll(/\.svg\/.*/g, ".svg"));
        $(ele).attr("srcset", $(ele).attr("srcset").replaceAll("thumb/", "").replaceAll(/\.svg\/[^ ]*/g, ".svg"));
    }
});
$("img[data-lazy-src*='.svg.png']").each(function (_, ele) {
    var _a;
    if ($(ele).attr("data-lazy-src").indexOf("img.moegirl.org.cn/") > -1) {
        $(ele)
            .attr("src", $(ele).attr("data-lazy-src").replaceAll("thumb/", "").replaceAll(/\.svg\/.*/g, ".svg"))
            .attr("srcset", (_a = $(ele).attr("data-lazy-srcset")) === null || _a === void 0 ? void 0 : _a.replaceAll("thumb/", "").replaceAll(/\.svg\/[^ ]*/g, ".svg"))
            .removeAttr("data-lazy-state");
        $(ele).replaceWith($(ele).clone());
    }
});
