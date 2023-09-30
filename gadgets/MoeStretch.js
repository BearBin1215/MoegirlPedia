"use strict";
if (mw.config.get("skin") === "moeskin") {
    $("main.moe-flexible-container").css("transition", "width .24s ease");
    const $stretchStyle = $("<style>@media screen and (min-width:768px){#moe-main-container .moe-flexible-container{width:calc(100% - 2rem);margin:1rem 1rem 0}}</style>");
    const $stretchButton = $("#moe-sidenav-toggle-btn").clone().attr("id", "bearbin-moe-stretch").removeAttr("href");
    if (localStorage.getItem("moeStretch") === null) {
        localStorage.setItem("moeStretch", "0");
    }
    if (localStorage.getItem("moeStretch") === "1") {
        $("head").append($stretchStyle);
    }
    $stretchButton.on("click", () => {
        if (localStorage.getItem("moeStretch") === "0") {
            $("head").append($stretchStyle);
            localStorage.setItem("moeStretch", "1");
        } else {
            $stretchStyle.remove();
            localStorage.setItem("moeStretch", "0");
        }
    });
    $stretchButton.children(".xicon").html('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M6.5 3.5 0 10l1.5 1.5 5 5L8 15l-5-5 5-5zm7 0L12 5l5 5-5 5 1.5 1.5L20 10z"/></svg>');
    $stretchButton.children(".tooltip").text("清空边距");
    $(".btn-group.tools-extra").prepend($stretchButton);
}