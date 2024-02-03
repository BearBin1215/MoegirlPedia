$('img[srcset*=".svg.png"]').each(function (_, ele) {
  if ($(ele).attr('srcset').indexOf('img.moegirl.org.cn/') > -1) {
    $(ele).attr('src', $(ele).attr('src').replace(/thumb\//g, '').replace(/\.svg\/.*/g, '.svg'));
    $(ele).attr('srcset', $(ele).attr('srcset').replace(/thumb\//g, '').replace(/\.svg\/[^ ]*/g, '.svg'));
  }
});
$('img[data-lazy-src*=\'.svg.png\']').each(function (_, ele) {
  if ($(ele).attr('data-lazy-src').indexOf('img.moegirl.org.cn/') > -1) {
    var dataLazySrcset = $(ele).attr('data-lazy-srcset');
    $(ele)
      .attr('src', $(ele).attr('data-lazy-src').replace(/thumb\//g, '').replace(/\.svg\/.*/g, '.svg'))
      .attr('srcset', dataLazySrcset ? dataLazySrcset.replace(/thumb\//g, '').replace(/\.svg\/[^ ]*/g, '.svg') : '')
      .removeAttr('data-lazy-state');
    $(ele).replaceWith($(ele).clone());
  }
});
