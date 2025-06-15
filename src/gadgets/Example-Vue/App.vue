<template>
  <div class="vue-component-example">
    {{ msg }}
  </div>
</template>

<script setup lang="ts">
const { ref } = Vue;

const msg = ref("Hello, Vue!");
</script>

<style scoped lang="less">
.vue-component-example {
  color: blue;
}
</style>
