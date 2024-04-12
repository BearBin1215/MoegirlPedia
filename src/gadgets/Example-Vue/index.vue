<template>
  <div class="vue-component-example">
    {{ msg }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: 'Hello, Vue!',
    };
  },
};
</script>

<style scoped>
.vue-component-example {
  color: blue;
}
</style>
