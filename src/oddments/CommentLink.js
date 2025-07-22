/**
 * @description 编辑摘要锚点链接改为高版本一样的整个锚点名都可以点
 */

$('.autocomment').each((_, ele) => {
  $(ele).appendTo($(ele).parent().prev('a'));
});
