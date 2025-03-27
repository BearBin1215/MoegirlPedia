<template>
  <div class="vue-component-example">
    {{ msg }}
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const msg = ref("Hello, Vue!");
</script>

<style scoped lang="less">
.vue-component-example {
  color: blue;
}
</style>
