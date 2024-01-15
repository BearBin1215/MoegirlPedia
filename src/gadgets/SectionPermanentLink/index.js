/**
 * @description 在各种讨论页的标题后方添加按钮，复制本章节的带锚点固定连接
 */

if (mw.config.get('wgNamespaceNumber') % 2 === 1) {
  const buttunText = wgULS('固定链接', '固定連結');
  $('#mw-content-text .mw-parser-output h2').each((_, ele) => {
    const $ele = $(ele);
    const $divider = $('<span class="mw-editsection-divider"> | </span>'); // 分隔符
    const $permanentLink = $(`<a>${buttunText}</a>`); // 复制按钮
    if (document.getElementsByClassName('mw-editsection')[0]) {
      // 有编辑按钮时将元素添加到现有的编辑按钮边上
      $(ele)
        .find('.mw-editsection-bracket')
        .first()
        .after($divider)
        .after($permanentLink);
      const $marButton = $ele.find('.AnnTools_MarkAsResolved');
      // 使按钮顺序位于MAR之后
      if ($marButton[0]) {
        const $marDivider = $marButton.next('.mw-editsection-divider');
        if ($marDivider.length > 0) {
          $marDivider.after($divider).after($permanentLink);
        }
      }
    } else {
      // 没有编辑按钮时新增一个
      $ele
        .find('.mw-headline')
        .after($('<span class="mw-editsection"></span>').append(
          '<span class="mw-editsection-bracket">[</span>',
          $permanentLink,
          '<span class="mw-editsection-bracket">]</span>',
        ));
    }
    $permanentLink.on('click', () => {
      navigator.clipboard.writeText(`[[Special:PermanentLink/${mw.config.get('wgRevisionId')}#${$ele.find('.mw-headline').attr('id')}]]`);
      $permanentLink.text(wgULS('复制成功', '復製成功'));
      setTimeout(() => {
        $permanentLink.text(buttunText);
      }, 2000);
    });
  });
}