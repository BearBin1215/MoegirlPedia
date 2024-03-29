interface HTMLElementWithAllStyles extends HTMLElement {
  allStyles?: string;
}

$(() => (async () => {
  if (!document.getElementsByClassName('Lyrics')[0] && !(document.getElementsByClassName('poem')[0] && $('#catlinks').text().match(/音[乐樂]作品/))) {
    return;
  }
  await mw.loader.using(['user.options', 'ext.gadget.libBottomRightCorner', 'ext.gadget.site-lib']);
  const btn = insertToBottomRightCorner('歌词除色').attr('id', 'lyric-style-toggle').css({
    'user-select': 'none',
    order: '60',
  });

  btn.on('click', () => {
    $(document.body).toggleClass('lyric-style-toggle-on');

    if (document.getElementsByClassName('lyric-style-toggle-on')[0]) {
      $('.Lyrics-original').each(function (this: HTMLElementWithAllStyles) {
        this.allStyles = $(this).attr('style');
        $(this).attr('style', 'color:#000');
      });
      $('.Lyrics-translated').each(function (this: HTMLElementWithAllStyles) {
        this.allStyles = $(this).attr('style');
        $(this).attr('style', 'color:#656565');
      });
      $('.Lyrics, .Lyrics span:not(.mw-collapsible), .poem, .poem span').each(function (this: HTMLElementWithAllStyles) {
        this.allStyles = $(this).attr('style');
        $(this).attr('style', '');
      });
      btn.text('恢复样式');
    } else {
      $('.Lyrics, .Lyrics-original, .Lyrics-translated, .Lyrics span:not(.mw-collapsible), .poem, .poem span').each(function (this: HTMLElementWithAllStyles) {
        $(this).attr('style', this.allStyles!);
      });
      btn.text('歌词除色');
    }
  });
})());
