$(function () {
    $("pre").each(function () {
        var _a;
        $("head").append("<style>pre::before{content:attr(lang);display:block;text-align:right;font-weight:700;margin-right:.5em;}</style>");
        var preLang = $(this).attr("lang");
        if (!preLang) {
            preLang = ((_a = $(this).attr("class")) === null || _a === void 0 ? void 0 : _a.match(/lang-[a-zA-Z]*/i)[0].replace("lang-", "")) || "";
            $(this).attr("lang", preLang);
        }
    });
});
