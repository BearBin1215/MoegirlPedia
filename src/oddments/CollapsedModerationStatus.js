/** @description 最近更改列表中，将被合并折叠的多条记录中最新记录状态作为整个状态显示 */
$('.mw-collapsible.mw-changeslist-line').each((_, ele) => {
  const $modIcon = $(ele).find('.mod-status-icon').first();
  if (!$modIcon[0]) {
    return;
  }
  if ($modIcon[0].previousSibling.textContent.includes('（')) {
    $modIcon[0].nextSibling.remove();
  }
  $modIcon[0].previousSibling.remove();
  $(ele).find('tbody>tr:first-child .mw-changeslist-line-inner').prepend($modIcon);
});
