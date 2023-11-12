import "./index.less";

$(() => (async () => {
    if (mw.config.get("wgPageName") !== "Special:TextDiff") {
        if (window.TextDiff) {
            await mw.loader.using("mediawiki.util");
            mw.util.addPortletLink("p-tb", "/Special:TextDiff", "文本差异比较", "t-textdiff");
        }
        return;
    }
    await mw.loader.using(["mediawiki.api", "oojs-ui", "mediawiki.notification"]);
    const api = new mw.Api();

    // 获取比较差异
    const compare = async (fromtext, totext) => {
        try {
            const res = await api.post({
                action: "compare",
                fromtext,
                totext,
                topst: true,
                fromtitle: "PAGENAME",
            });
            return res.compare["*"];
        } catch(error) {
            mw.notify(`获取差异失败：${error}`, { type: "warn" });
        }
    };

    // 获取页面源代码
    const getSource = async (title) => {
        try {
            const res = await api.get({
                action: "query",
                prop: "revisions",
                titles: title,
                rvprop: "content",
            });
            return Object.values(res.query.pages)[0].revisions[0]["*"];

        } catch(error) {
            mw.notify(`获取源代码失败：${error}`, { type: "warn" });
        }
        mw.notify("获取源代码完毕");
    };

    $("#mw-notification-area").appendTo("body"); // 使提醒在窗口上层
    mw.config.set("wgCanonicalSpecialPageName", "TextDiff");
    $("title").text("差异比较 - 萌娘百科_万物皆可萌的百科全书");
    $("head").append(
        `<link rel="stylesheet" href="${mw.config.get("wgLoadScript")}?debug=false&modules=mediawiki.diff.styles&only=styles" />`,
        '<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>',
        '<script src="https://npm.elemecdn.com/file-saver/dist/FileSaver.min.js"></script>',
    );
    $(".mw-invalidspecialpage").removeClass("mw-invalidspecialpage");
    $("#firstHeading").html("差异比较<div>By BearBin</div>");
    $("#contentSub").remove();

    const fromTextBox = new OO.ui.MultilineTextInputWidget({
        rows: 10,
        maxRows: 10,
        autosize: true,
    });

    const fromPageBox = new OO.ui.TextInputWidget( {
        labelPosition: "before",
        label: "从页面",
    });

    const fromPageButton = new OO.ui.ButtonWidget({
        label: "获取源代码",
        flags: [
            "progressive",
        ],
        id: "from-page-button",
    });

    const $getOriginSource = $('<div class="get-source-from-page"></div>').append(
        fromPageBox.$element,
        fromPageButton.$element,
    );

    const toPageBox = new OO.ui.TextInputWidget( {
        labelPosition: "before",
        label: "从页面",
    });

    const toPageButton = new OO.ui.ButtonWidget({
        label: "获取源代码",
        flags: [
            "progressive",
        ],
        id: "from-page-button",
    });

    const $getTargetSource = $('<div class="get-source-from-page"></div>').append(
        toPageBox.$element,
        toPageButton.$element,
    );

    const toTextBox = new OO.ui.MultilineTextInputWidget({
        rows: 10,
        maxRows: 10,
        autosize: true,
    });

    const submitButton = new OO.ui.ButtonWidget({
        label: "比较",
        flags: [
            "primary",
            "progressive",
        ],
        icon: "check",
        id: "submit-button",
    });

    const saveButton = new OO.ui.ButtonWidget({
        label: "保存图片",
        icon: "download",
        id: "save-button",
    });

    const copyButton = new OO.ui.ButtonWidget({
        label: "复制到剪贴板",
        id: "copy-button",
    });

    const $result = $('<div id="diff-result"></div>');

    const $resultAction = $('<div id="result-action"></div>').append(
        saveButton.$element,
        copyButton.$element,
    ).hide();

    $("#mw-content-text").empty().append(
        $("<h3>旧版本</h3>"),
        fromTextBox.$element,
        $getOriginSource,
        $("<h3>新版本</h3>"),
        toTextBox.$element,
        $getTargetSource,
        submitButton.$element,
        $("<h3>差异</h3>"),
        $result,
        $resultAction,
    );

    // 保存图片
    const saveImage = () => {
        html2canvas($result[0]).then((canvas) => {
            saveAs(canvas.toDataURL("image/png"), "image.png");
        });
    };

    // 复制图片至剪贴板
    const copyImage = () => {
        html2canvas($result[0]).then((canvas) => {
            canvas.toBlob((blob) => {
                navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).then(() => {
                    mw.notify("复制成功");
                }, (error) => {
                    mw.notify(`复制失败：${error}`, { type: "warn" });
                });
            });
        });
    };

    // 通过页面获取源代码按钮
    fromPageButton.on("click", async () => {
        const source = await getSource(fromPageBox.getValue());
        fromTextBox.setValue(source);
    });

    toPageButton.on("click", async () => {
        const source = await getSource(toPageBox.getValue());
        toTextBox.setValue(source);
    });

    submitButton.on("click", async () => {
        submitButton.setDisabled(true);
        try {
            const result = await compare(fromTextBox.getValue(), toTextBox.getValue());
            $result.html(`
            <table class="diff diff-contentalign-left">
                <colgroup>
                    <col class="diff-marker">
                    <col class="diff-content">
                    <col class="diff-marker">
                    <col class="diff-content">
                </colgroup>
                <tbody>
                    ${result}
                </tbody>
            </table>
            `);
            $resultAction.show();
        } catch (error) {
            mw.notify(`比较出错：${error}`, { type: "warn" });
        }
        submitButton.setDisabled(false);
    });

    saveButton.on("click", () => {
        saveImage();
    });

    copyButton.on("click", () => {
        copyImage();
    });
})());