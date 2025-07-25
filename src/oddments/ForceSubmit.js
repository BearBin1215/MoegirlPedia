/**
 * @description 编辑自己的CSS和JS页时不弹窗提示语法错误
 */

if (
  ['css', 'javascript'].includes(mw.config.get('wgPageContentModel'))
  && ['edit', 'submit'].includes(mw.config.get('wgAction'))
  && mw.config.get('wgUserName') === mw.config.get('wgRelevantUserName')
) {
  const $wpSave = $('#wpSave');
  $wpSave.replaceWith($wpSave.clone().on('click', () => {
    $('#editform').trigger('submit');
  }));
}
