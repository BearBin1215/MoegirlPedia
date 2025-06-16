/**
 * @description 使用Vue开发小工具示例
 */

mw.loader.using(['vue', 'pinia']).done((require) => {
  // Pinia和vue不同，不会自己挂载到全局，要手动添加
  window.Pinia = require('pinia');

  // 用异步形式引入，否则在声明组件的时候找不到vue就会报错
  import('./App.vue').then(({ 'default': App }) => {
    const pinia = window.Pinia.createPinia();
    const app = Vue.createApp(App);
    app.use(pinia);
    app.mount('#bodyContent');
  });
});
