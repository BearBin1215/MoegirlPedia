if (mw.config.get('wgCanonicalSpecialPageName') === 'Whatlinkshere') {
  $('#mw-content-text>p>strong').after($('<a>[复制列表]</a>').on('click', function (e) {
    var linkList = $('#mw-whatlinkshere-list>li>a').map(function (_, ele) {
      return $(ele).text();
    }).get();
    navigator.clipboard.writeText(linkList.join('\n')).then(function () {
      $(e.target).text('[复制成功]');
      setTimeout(function () {
        $(e.target).text('[复制列表]');
      }, 3000);
    }, function (err) {
      $(e.target).text('[复制失败：' + err + ']');
      setTimeout(function () {
        $(e.target).text('[复制列表]');
      }, 3000);
    });
  }).css('padding-left', '.6em'));
}
