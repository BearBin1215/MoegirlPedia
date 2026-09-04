<template>
  <div class='vue-component-example'>
    <cdx-text-input
      v-model='text'
      placeholder='在此输入内容'
    />
    <cdx-toggle-switch v-model='checked'>
      开关状态：{{ checked ? '开' : '关' }}
    </cdx-toggle-switch>
    <div class='vue-component-example__buttons'>
      <cdx-button
        weight='quiet'
        @click='reset'
      >
        重置
      </cdx-button>
      <cdx-button
        action='progressive'
        weight='primary'
        @click='copy'
      >
        复制文本
      </cdx-button>
    </div>
  </div>
</template>

<script setup lang='ts'>
// Codex组件运行时由window.Codex提供（rspack externals），IDE类型提示来自npm包
// rspack配置中将pinia库指向window.Pinia，在index.ts中挂载好就可以使用
import { CdxButton, CdxTextInput, CdxToggleSwitch } from '@wikimedia/codex';
import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import { copyText } from '@/utils/clipboard';

const useStore = defineStore('store', {
  state: () => ({
    text: 'Hello, Vue + Codex!',
  }),
});

const store = useStore();

const { text } = storeToRefs(store);

const checked = ref(false);

/** 重置文本和开关状态 */
const reset = () => {
  store.$patch({ text: 'Hello, Vue + Codex!' });
  checked.value = false;
};

/** 复制当前文本 */
const copy = () => copyText(text.value);
</script>

<style scoped>
.vue-component-example {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.8em;
  max-width: 32em;
}

.vue-component-example__buttons {
  display: flex;
  gap: 0.5em;
}
</style>
