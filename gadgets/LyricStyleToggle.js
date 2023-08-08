// eslint-disable-next-line
var _addText = '{{Documentation|content=本小工具用于在有{{tl|LyricsKai}}或其衍生模板的页面右下角添加一个“歌词除色”按钮，可以切换开关歌词样式。\n\n使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码\n<pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("/index.php?title=User:BearBin/js/LyricStyleToggle.js&action=raw&ctype=text/javascript");</pre>}}';

// <pre>
"use strict";
$(() => (async () => {
    if (!document.getElementsByClassName("Lyrics")[0] && !(document.getElementsByClassName("poem")[0] && $("#catlinks").text().match(/音[乐樂]作品/))) {
        return;
    }
    await mw.loader.using(["user.options", "ext.gadget.libBottomRightCorner", "ext.gadget.site-lib"]);
    const btn = insertToBottomRightCorner("歌词除色").attr("id", "lyric-style-toggle").css({
        "user-select": "none",
        order: "60",
    });

    btn.on("click", () => {
        $("body").toggleClass("lyric-style-toggle-on");

        if (document.getElementsByClassName("lyric-style-toggle-on")[0]) {
            $(".Lyrics-original").each(function () {
                this.allStyles = $(this).attr("style");
                $(this).attr("style", "color:#000");
            });
            $(".Lyrics-translated").each(function () {
                this.allStyles = $(this).attr("style");
                $(this).attr("style", "color:#656565");
            });
            $(".Lyrics, .Lyrics span:not(.mw-collapsible), .poem, .poem span").each(function () {
                this.allStyles = $(this).attr("style");
                $(this).attr("style", "");
            });
            btn.text("恢复样式");
        } else {
            $(".Lyrics, .Lyrics-original, .Lyrics-translated, .Lyrics span:not(.mw-collapsible), .poem, .poem span").each(function () {
                $(this).attr("style", this.allStyles);
            });
            btn.text("歌词除色");
        }
    });
})());

// </pre>