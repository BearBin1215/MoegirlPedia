(()=>{"use strict";if(mw.config.get("wgNamespaceNumber")%2==1){var e=wgULS("固定链接","固定連結");$("#mw-content-text .mw-parser-output h2").each((function(t,a){var n=$(a),i=$('<span class="mw-editsection-divider"> | </span>'),s=$('<a data-thread-id="'.concat(n.find(".mw-headline").attr("id"),'">').concat(e,"</a>"));if(document.getElementsByClassName("mw-editsection")[0]){$(a).find(".mw-editsection-bracket").first().after(i).after(s);var c=n.find(".AnnTools_MarkAsResolved");if(c[0]){var d=c.next(".mw-editsection-divider");d.length>0&&d.after(i).after(s)}}else{var r=$('<span class="mw-editsection"></span>');r.append('<span class="mw-editsection-bracket">[</span>',s,'<span class="mw-editsection-bracket">]</span>'),n.find(".mw-headline").after(r)}s.on("click",(function(){navigator.clipboard.writeText("[[Special:PermanentLink/".concat(mw.config.get("wgRevisionId"),"#").concat(s.data("thread-id"),"]]")),s.text(wgULS("复制成功","復製成功")),setTimeout((function(){s.text(e)}),2e3)}))}))}})();