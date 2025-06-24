<template>
  <div class='vue-component-example'>
    {{ text }}
  </div>
</template>

<script setup lang='ts'>
// webpack配置中将pinia库指向window.Pinia，在index.ts中挂载好就可以使用
import { defineStore, storeToRefs } from 'pinia';

const useStore = defineStore('store', {
  state: () => ({
    text: 'Hello, Vue!',
  }),
});

const store = useStore();

const { text } = storeToRefs(store);
</script>

<style
  scoped
  lang='less'
>
.vue-component-example {
  color: blue;
}
</style>
