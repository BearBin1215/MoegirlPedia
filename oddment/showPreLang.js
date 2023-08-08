"use strict";
$(() => {
    $("pre").each(function () {
        $("head").append("<style>pre::before{content:attr(lang);display:block;text-align:right;font-weight:700;margin-right:.5em;}</style>");
        let preLang = $(this).attr("lang");
        if (!preLang) {
            preLang = $(this).attr("class")?.match(/lang-[a-zA-Z]*/i)[0].replace("lang-", "") || "";
            $(this).attr("lang", preLang);
        }
    });
});