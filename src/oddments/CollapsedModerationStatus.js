/** @description 最近更改列表中，将被合并折叠的多条记录中最新记录状态作为整个状态显示 */
$('.mw-collapsible.mw-changeslist-line').each(function (_, ele) {
  $(ele).find('tbody>tr:first-child .mw-changeslist-line-inner').prepend($(ele).find('.mod-status-icon').first().clone());
});
