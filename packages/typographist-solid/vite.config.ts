import { fileURLToPath } from 'node:url';

import solid from 'vite-plugin-solid';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [solid()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    emptyOutDir: false,
    lib: { entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)), formats: ['es'], fileName: 'index' },
    rolldownOptions: {
      external: (id) =>
        id === '@elmenov-softworks/typographist' ||
        id.startsWith('@elmenov-softworks/typographist/') ||
        id === 'solid-js' ||
        id.startsWith('solid-js/'),
    },
  },
});
