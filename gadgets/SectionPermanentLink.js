/**
 * @description 在各种讨论页的标题后方添加按钮，复制本章节的带锚点固定连接
 */
"use strict";
$(() => {
    if (mw.config.get("wgNamespaceNumber") % 2 === 1) {
        const inHistory = !document.getElementsByClassName("mw-editsection")[0];
        $("h2").each((_, ele) => {
            const permanentLink = $(`<a data-thread-id="${$(ele).find(".mw-headline").attr("id")}">固定连接</a>`);
            if(!inHistory) {
                const permanentLinkButton = $('<span><span class="mw-editsection-divider"> | </span></span>');
                permanentLinkButton.append(permanentLink);
                $(ele).find(".mw-editsection .mw-editsection-bracket:last-child").before(permanentLinkButton);
            } else {
                const permanentLinkButton = $('<span class="mw-editsection"></span>');
                permanentLinkButton.append(
                    '<span class="mw-editsection-bracket">[</span>',
                    permanentLink,
                    '<span class="mw-editsection-bracket">]</span>',
                );
                $(ele).find(".mw-headline").after(permanentLinkButton);
            }
            permanentLink.on("click", () => {
                navigator.clipboard.writeText(`[[Special:PermanentLink/${mw.config.get("wgRevisionId")}#${permanentLink.data("thread-id")}]]`);
                permanentLink.text("复制成功");
                setTimeout(() => {
                    permanentLink.text("固定连接");
                }, 2000);
            });
        });
    }
});