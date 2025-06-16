<template>
  <div class='vue-component-example'>
    {{ text }}
  </div>
</template>

<script setup lang='ts'>
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
