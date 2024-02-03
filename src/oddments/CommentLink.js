$('.autocomment').each(function (_, ele) {
  $(ele).appendTo($(ele).parent().prev('a'));
});