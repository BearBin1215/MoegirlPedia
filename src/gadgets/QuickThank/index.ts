/**
 * @description 在特殊页面（最近更改、监视列表、用户贡献等）的编辑历史行添加感谢按钮
 */

if (mw.config.get('wgNamespaceNumber') === -1 && mw.config.get('wgTitle').replace(/.*\//g, '') !== mw.config.get('wgUserName')) {
  mw.loader.using(['mediawiki.api', 'oojs-ui']).then(() => {
    $('.mw-changeslist-line-inner, .mw-enhanced-rc-nested').each((_, ele) => {
      const $ele = $(ele);
      const rev = $ele.closest('[data-mw-revid]').attr('data-mw-revid');
      if (!rev || $ele.find('bdi').text() === mw.config.get('wgUserName')) {
        return;
      }
      const $thankButton = $('<a class="quick-thank">[感谢]</a>') as JQuery<HTMLAnchorElement>;
      $thankButton.on('click', async (e) => {
        e.preventDefault();
        const confirm = await OO.ui.confirm('确定要感谢吗？', {
          title: '确认',
          size: 'small',
        });
        if (confirm) {
          $thankButton.html('[感谢<span style="display:inline-block;animation:rotate 2s linear infinite;">↻</span>]');
          const api = new mw.Api();
          api.postWithToken('csrf', {
            format: 'json',
            action: 'thank',
            source: 'diff',
            rev,
          }).done(() => {
            $thankButton.text('[感谢成功]');
            setTimeout(() => {
              $thankButton.remove();
            }, 3000);
          }).fail((err) => {
            $thankButton.text(`[感谢失败：${err}]`);
            setTimeout(() => {
              $thankButton.text('[感谢]');
            }, 3000);
          });
        }
      });
      $ele.append($thankButton);
    });
  });
}
