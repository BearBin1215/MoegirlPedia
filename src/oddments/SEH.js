$('a[href^="/User:%E8%90%8C%E5%A8%98%E7%99%BE%E7%A7%91%C2%B7"]').each(function (_, ele) {
  $(ele).closest('.mw-changeslist-line-inner').css('background-color', 'rgba(204, 255, 0, .1)');
});