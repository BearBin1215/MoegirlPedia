<template>
  <div class="vue-component-example">
    {{ msg }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      msg: 'Hello, Vue!',
    };
  },
});
</script>

<style scoped>
.vue-component-example {
  color: blue;
}
</style>
