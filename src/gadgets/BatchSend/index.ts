/**
 * @description 批量发送讨论页提醒（Vue + Codex重构版）
 */
import './index.css';

$(() => {
  // 非目标页时添加工具入口链接
  if (mw.config.get('wgPageName') !== 'Special:BatchSend') {
    void mw.loader.using(['mediawiki.util']).then(() => {
      mw.util.addPortletLink('p-tb', '/Special:BatchSend', '群发提醒', 't-batchsend');
    });
    return;
  }

  void mw.loader.using(['vue', '@wikimedia/codex', 'mediawiki.api', 'oojs-ui']).then((require) => {
    // Codex组件运行时由window.Codex提供（rspack externals），与Example-Vue相同的模式
    window.Codex = require('@wikimedia/codex');

    // 假Special页处理（作用于Vue挂载根之外的元素，保留jQuery实现）
    mw.config.set('wgCanonicalSpecialPageName', 'BulkMove');
    document.title = '群发提醒 - 萌娘百科_万物皆可萌的百科全书';
    $('.mw-invalidspecialpage').removeClass('mw-invalidspecialpage');
    $('#firstHeading').html('群发讨论页消息<div>By <a href="/User:BearBin">BearBin</a></div>');
    $('#contentSub').remove();

    // 用异步形式引入，否则在声明组件的时候找不到vue就会报错
    import('./App.vue').then(({ 'default': App }) => {
      Vue.createApp(App).mount('#mw-content-text');
    });
  });
});
