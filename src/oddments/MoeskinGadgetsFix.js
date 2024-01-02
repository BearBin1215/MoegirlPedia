$(function () {
    setTimeout(function () {
        $(".moe-siderail-sticky").prepend($("#moe-custom-sidenav-block"));
        $("#side-toc-container .moe-table-of-contents").css("max-height", "calc((100vh - 100px - 8rem)/2)");
    }, 500);
});