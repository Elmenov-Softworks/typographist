import { fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    emptyOutDir: false,
    lib: { entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)), formats: ['es'], fileName: 'index' },
    rolldownOptions: {
      external: (id) =>
        id === '@elmenov-softworks/typographist' ||
        id.startsWith('@elmenov-softworks/typographist/') ||
        id === 'vue' ||
        id.startsWith('vue/'),
    },
  },
});
