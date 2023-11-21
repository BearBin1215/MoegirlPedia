document.querySelectorAll(".diff-contentalign-left tr:not(.diff-title) div").forEach(function (ele) {
    ele.innerHTML = ele.innerHTML.replace(/\[\[([^\]|{<>]+)(?:\|([^\]]+))?\]\]/g, function (match, pageName, displayName) {
        var link = "<a href=\"/".concat(encodeURIComponent(pageName), "\" style=\"color:#042F76\">").concat(pageName, "</a>");
        if (displayName) {
            link = "".concat(link, "|").concat(displayName);
        }
        link = "[[".concat(link, "]]");
        return link;
    });
});
