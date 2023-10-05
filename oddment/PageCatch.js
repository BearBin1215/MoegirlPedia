"use strict";
mw.loader.using(["mediawiki.notification", "oojs-ui"]).then(() => {
    $(mw.util.addPortletLink("p-cactions", "javascript:void(0)", "复制截图", "ca-pagecatch")).on("click", () => {
        mw.notify("正在复制……");
        $("#mw-notification-area").appendTo("body"); // 使提醒在窗口上层
        const script = document.createElement("script");
        script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js";
        document.head.appendChild(script);

        script.onload = () => {
            html2canvas(document.getElementById("mw-content-text")).then((canvas) => {
                canvas.toBlob((blob) => {
                    navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).then(() => {
                        mw.notify("复制成功");
                    }, (error) => {
                        mw.notify(`复制失败：${error}`, { type: "warn" });
                    });
                });
            });
        };
    });
});