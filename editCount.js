"use strict";
$(() => {
    if (mw.config.get("skin") === "vector") {
        $("#pt-mycontris").append(`(${ mw.config.get("wgUserEditCount") })`);
    }
    else {
        $("#moe-user-dropdown");
    }
});