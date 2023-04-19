/**
 * 狂暴鸿儒
 */
"use strict";
$(() => (async () => {
    await mw.loader.using(["mediawiki.api", "mediawiki.util", "mediawiki.notification", "oojs-ui"]);
    if (mw.config.get("wgAction") === "edit") {
        const title = mw.config.get("wgPageName");
        const $body = $("body");
        //@todo 获取当前编辑章节
        let section = location.href.replace(/.*&section=(\d+).*/g, "$1");
        if (isNaN(section)) {
            section = "";
        }

        class DoSEWindow extends OO.ui.ProcessDialog {
            static static = {
                ...super.static,
                tagName: "div",
                name: "lr-masssned",
                title: "确认编辑",
                actions: [
                    {
                        action: "cancel",
                        label: "取消",
                        flags: ["safe", "close", "destructive"],
                    },
                    {
                        action: "submit",
                        label: "编辑",
                        flags: ["primary", "progressive"],
                    },
                ],
            };
            constructor(config) {
                super(config);
            }

            initialize() {
                super.initialize();
                this.panelLayout = new OO.ui.PanelLayout({
                    scrollable: false,
                    expanded: false,
                    padded: true,
                });

                this.noteField = new OO.ui.PanelLayout({
                    padded: true,
                    expanded: false,
                });
                this.noteField.$element.append("<p>确认要编辑吗？</p>");

                this.panelLayout.$element.append(this.noteField.$element);
                this.$body.append(this.panelLayout.$element);
            }

            getActionProcess(action) {
                if (action === "cancel") {
                    return new OO.ui.Process(() => {
                        this.close({ action });
                    }, this);
                } else if (action === "submit") {
                    const text = $("#wpTextbox1").val();
                    const summary = $("#wpSummary").val();
                    let attempts = 1;
                    return new OO.ui.Process($.when((async () => {
                        try {
                            await new mw.Api().postWithToken("csrf", {
                                format: "json",
                                action: "edit",
                                minor: true,
                                summary: summary,
                                title: title,
                                text: text,
                            })
                                .done(() => {
                                    oouiDialog.alert(`发送成功！合计尝试${attempts}次。`);
                                })
                                .fail(() => {
                                    attempts++;
                                });
                            this.close({ action });
                        } catch (e) {
                            console.error("OOUI error:", e);
                            throw new OO.ui.Error(e);
                        }
                    })()).promise(), this);
                }
                return super.getActionProcess(action);
            }
        }

        const windowManager = new OO.ui.WindowManager();
        $body.append(windowManager.$element);
        const DoSEDialog = new DoSEWindow({
            size: "small",
        });
        windowManager.addWindows([DoSEDialog]);

        $(mw.util.addPortletLink("p-cactions", "#", "狂暴鸿儒", "mass-send", "狂暴鸿儒", "r")).on("click", (e) => {
            e.preventDefault();
            windowManager.openWindow(DoSEDialog);
            $body.css("overflow", "auto");
        });
    }
})());