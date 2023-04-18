"use strict";
$(() => {
    if (mw.config.get("skin") === "vector") {
        $("#pt-mycontris a").append(`(${mw.config.get("wgUserEditCount")})`);
    }
    else {
        $("#moe-user-dropdown");
    }
});