import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    name: 'rules-transformer',
    root: fileURLToPath(new URL('.', import.meta.url)),
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.{ts,tsx}'],
  },
});
