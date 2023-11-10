import "./index.less";

if (["edit", "submit"].includes(mw.config.get("wgAction"))) {
    mw.loader.using("oojs-ui").done(() => {
        const itv = setInterval(() => {
            if (!document.getElementById("wikiEditor-section-advanced")) {
                return;
            }
            clearInterval(itv);

            let tableWikitext = "";

            // 输入面板
            const e2wHTML = $(`
            <div id="excel-to-wiki">
                <button id="e2w-close" title="关闭">×</button>
                <div id="e2w-panel">
                    <h5>在此处粘贴表格</h5>
                    <div id="e2w-input" contenteditable="true"></div>
                    <h5>输出<a id="e2w-copy">[复制]</a></h5>
                    <div id="e2w-output"></div>
                </div>
            </div>
            `);
            e2wHTML.appendTo($("body"));
            e2wHTML.hide();

            // 从编辑栏中复制插入表格的按钮并修改图标，绑定事件
            const tableButton = $('[rel="table"]');
            const excelButton = tableButton.clone();
            excelButton.attr("rel", "excel2wiki")
                .children().attr("title", "从Excel粘贴表格").on("click", (e) => {
                    e.preventDefault();
                    e2wHTML.show();
                })
                .children(".oo-ui-icon-table").removeClass("oo-ui-icon-table").addClass("oo-ui-icon-tableCaption");

            // 监视粘贴事件
            $("#e2w-input").on("paste", async function () {
                await new Promise((resolve) => setTimeout(resolve, 30)); // 要等待一下，不然获取不到子元素
                if (this.firstElementChild.tagName === "TABLE") { // 判断粘贴的内容是否为table标签
                    const wikitable = []; // 用于存放各tr内容
                    this.firstElementChild.querySelectorAll("tr").forEach((tr) => { // 遍历所有tr
                        const tableRow = []; // 用于存放各td内容
                        tr.querySelectorAll("td, th").forEach((td) => {
                            // 对于每一个td，判断其是否有大于1的colspan或rowspan属性并加入
                            tableRow.push(
                                /* eslint-disable prefer-template */
                                "| " +
                                (td.colSpan > 1 ? `colspan="${td.colSpan}" ` : "") +
                                (td.rowSpan > 1 ? `rowspan="${td.rowSpan}" ` : "") +
                                (td.colSpan + td.rowSpan > 2 ? "| " : "") +
                                td.innerText,
                                /* eslint-enable prefer-template */
                            );
                        });
                        wikitable.push(tableRow.join("<br>"));
                    });
                    // 加入换行后显示在输出栏以供复制
                    tableWikitext = `{|<br>${wikitable.join("<br>|-<br>")}<br>|}`;
                    $("#e2w-output").html(tableWikitext);
                } else {
                    console.info("Excel2Wiki: 非table标签。");
                }
            });

            // 点×关闭面板
            $("#e2w-close").on("click", () => {
                e2wHTML.hide();
            });

            // 复制
            $("#e2w-copy").on("click", (e) => {
                navigator.clipboard.writeText(tableWikitext.replaceAll("<br>", "\n")).then(() => {
                    $(e.target).text("[复制成功]");
                    setTimeout(() => $(e.target).text("[复制]"), 3000); // 恢复文字
                }, (err) => {
                    $(e.target).text(`[复制失败：${err}]`);
                    setTimeout(() => $(e.target).text("[复制]"), 3000);
                });
            });

            tableButton.after(excelButton);
        }, 500);
    });
}