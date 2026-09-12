import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // playground始终直连组件库源码，与tsdown产物路径无关（后续切换构建器无需调整）
      'oojs-ui-react': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 8090,
  },
});
