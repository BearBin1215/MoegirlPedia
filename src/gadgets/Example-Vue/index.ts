/**
 * @description 使用 Vue + pinia + Codex 开发小工具示例
 */

mw.loader.using(['vue', '@wikimedia/codex', 'pinia']).done((require) => {
  // Pinia和Codex不会自己挂载到全局，要手动添加；打包时由rspack externals指向对应全局变量
  window.Pinia = require('pinia');
  window.Codex = require('@wikimedia/codex');

  // 用异步形式引入，否则在声明组件的时候找不到vue就会报错
  import('./App.vue').then(({ 'default': App }) => {
    const pinia = window.Pinia.createPinia();
    const app = Vue.createApp(App);
    app.use(pinia);
    app.mount('#mw-content-text');
  });
});
