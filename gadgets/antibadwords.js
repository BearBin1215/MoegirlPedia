/**
 * @description 反一方通行
 * @todo 支持非特殊页面
 * <pre>
 */

"use strict";
$(() => (async () => {
    if (mw.config.get("wgNamespaceNumber") === -1) {
        // 特殊页面通过<a>的href获取原文
        $("a").each(function () {
            const wordStart = $(this).text().indexOf("\u266f");
            const wordEnd = $(this).text().lastIndexOf("\u266f");
            if (wordStart > -1) {
                const urlfText = decodeURI($(this).attr("href").substring(1).replace("index.php?title=User:", "").replace("&action=edit&redlink=1", ""));
                const hrefText = `${urlfText.substring(0, wordStart)}<span style="background:#ccff00">${urlfText.substring(wordStart, wordEnd + 1)}</span>${urlfText.substring(wordEnd + 1)}`;
                $(this).html(hrefText);
            }
        });
    } else {

    }

})());
/**
 * </pre>
 */