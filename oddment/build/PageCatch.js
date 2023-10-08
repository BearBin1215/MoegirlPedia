mw.loader.using(["mediawiki.notification", "oojs-ui"]).then(function () {
    $(mw.util.addPortletLink("p-cactions", "javascript:void(0)", "复制截图", "ca-pagecatch")).on("click", function () {
        mw.notify("正在复制……");
        $("#mw-notification-area").appendTo("body");
        var script = document.createElement("script");
        script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js";
        document.head.appendChild(script);
        script.onload = function () {
            html2canvas(document.getElementById("mw-content-text")).then(function (canvas) {
                canvas.toBlob(function (blob) {
                    navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).then(function () {
                        mw.notify("复制成功");
                    }, function (error) {
                        mw.notify("\u590D\u5236\u5931\u8D25\uFF1A".concat(error), { type: "warn" });
                    });
                });
            });
        };
    });
});
