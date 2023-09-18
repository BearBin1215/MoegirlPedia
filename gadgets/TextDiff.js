// eslint-disable-next-line
var _addText = '{{Documentation|content=本小工具用于通过输入前后版本源代码输出差异，支持保存为图片或复制到剪贴板。\n\n使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码<pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("/index.php?title=User:BearBin/js/TextDiff.js&action=raw&ctype=text/javascript");</pre>\n添加后，前往[[Special:差异比较]]进行比较。}}';

"use strict";
$(() => (async () => {
    if (!["special:textdiff", "special:差异比较"].includes(mw.config.get("wgPageName").toLowerCase())) {
        if (window.TextDiff) {
            await mw.loader.using("mediawiki.util");
            mw.util.addPortletLink("p-tb", "/Special:TextDiff", "文本差异比较", "t-textdiff");
        }
        return;
    }
    await mw.loader.using(["mediawiki.api", "oojs-ui", "mediawiki.notification"]);
    const api = new mw.Api();

    const compare = async (fromtext, totext) => {
        const res = await api.post({
            action: "compare",
            fromtext,
            totext,
            topst: true,
            fromtitle: "PAGENAME",
        });
        return res.compare["*"];
    };

    mw.config.set("wgCanonicalSpecialPageName", "TextDiff");
    $("title").text("差异比较 - 萌娘百科_万物皆可萌的百科全书");
    $("head").append(
        `<style>
        #firstHeading {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: flex-end;
        }
        #firstHeading>div {
            font-size: .6em;
        }
        #bodyContent {
            padding-right: 0 !important;
        }
        #mw-content-text .oo-ui-textInputWidget {
            max-width: unset;
        }
        #submit-button {
            margin-top: .5em;
        }
        #diff-result {
            padding: .2em;
        }
        #result-action {
            margin-top: 1em;
        }
        </style>`,
        `<link rel="stylesheet" href="${mw.config.get("wgLoadScript")}?debug=false&modules=mediawiki.diff.styles&only=styles" />`,
        '<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>',
        '<script src="https://npm.elemecdn.com/file-saver/dist/FileSaver.min.js"></script>',
    );
    $(".mw-invalidspecialpage").removeClass("mw-invalidspecialpage");
    $("#firstHeading").html("差异比较<div>By BearBin</div>");
    $("#contentSub").remove();

    const fromTextBox = new OO.ui.MultilineTextInputWidget({
        validate: "non-empty",
        rows: 10,
        maxRows: 10,
        autosize: true,
    });

    const toTextBox = new OO.ui.MultilineTextInputWidget({
        validate: "non-empty",
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
        $("<h3>新版本</h3>"),
        toTextBox.$element,
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