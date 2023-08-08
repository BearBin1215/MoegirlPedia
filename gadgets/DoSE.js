/**
 * 狂暴鸿儒
 */
"use strict";
$(() => (async () => {
    await mw.loader.using(["mediawiki.api", "oojs-ui"]);
    if (mw.config.get("wgAction") === "edit") {
        const title = mw.config.get("wgPageName");
        //@todo 获取当前编辑章节
        let section = location.href.replace(/.*&section=(\d+).*/g, "$1");
        if (isNaN(section)) {
            section = "";
        }

        const DoSEButton = new OO.ui.ButtonWidget({
            label: "狂暴鸿儒",
            flags: [
                "destructive",
            ],
            id: "dose-submit",
        });

        $("#wpDiffWidget").after(DoSEButton.$element.css("margin", "0.5em 0.5em 0 0"));

        DoSEButton.on("click", async () => {
            $("#dose-submit a").addClass("oo-ui-pendingElement-pending");
            const text = $("#wpTextbox1").val();
            const summary = $("#wpSummary").val();
            let attempts = 1;
            let success = false;
            while(!success) {
                const action = await new mw.Api().postWithToken("csrf", {
                    format: "json",
                    action: "edit",
                    minor: true,
                    summary,
                    title,
                    text,
                });
                if(action.edit.result === "Success") {
                    oouiDialog.alert(`鸿儒成功！合计尝试${attempts}次。`);
                    success = true;
                } else {
                    attempts++;
                }
            }
            $("#dose-submit a").removeClass("oo-ui-pendingElement-pending");
        });
    }
})());