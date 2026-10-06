import { fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    name: 'typographist-vue',
    root: fileURLToPath(new URL('.', import.meta.url)),
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.{ts,tsx}'],
  },
});
