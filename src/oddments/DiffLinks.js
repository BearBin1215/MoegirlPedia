document.querySelectorAll('.diff-contentalign-left tr:not(.diff-title) div').forEach(function (ele) {
  ele.innerHTML = ele.innerHTML.replace(/\[\[([^\]|{<>]+)(?:\|([^\]]+))?\]\]/g, function (_match, pageName, displayName) {
    var link = '<a href="/' + encodeURIComponent(pageName.replace(/&nbsp;/g, '_')) + '" style="color:#042F76">' + pageName + '</a>';
    if (displayName) {
      link = link + '|' + displayName;
    }
    link = '[[' + link + ']]';
    return link;
  });
});