import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

/** esm中模拟cjs的__dirname */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
