document.querySelectorAll(".diff-contentalign-left tr:not(.diff-title) div").forEach((ele) => {
    ele.innerHTML = ele.innerHTML.replace(/\[\[([^\]|{<>]+)(?:\|([^\]]+))?\]\]/g, (match, pageName, displayName) => {
        let link = `<a href="/${encodeURIComponent(pageName.replace(/&nbsp;/g, "_"))}" style="color:#042F76">${pageName}</a>`;
        if (displayName) {
            link = `${link}|${displayName}`;
        }
        link = `[[${link}]]`;
        return link;
    });
});