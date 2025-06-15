/**
 * @description 使用Vue开发小工具示例
 * @author BearBin
 * @thanks 鬼影提供的webpackMode: "eager"方法
 */

mw.loader.using('vue').done(() => {
  import('./App.vue').then(({ 'default': App }) => {
    Vue.createApp(App).mount('#bodyContent');
  });
});
