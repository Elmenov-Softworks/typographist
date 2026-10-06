import { fileURLToPath } from 'node:url';

import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    name: 'typographist-solid',
    root: fileURLToPath(new URL('.', import.meta.url)),
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.{ts,tsx}'],
  },
});
