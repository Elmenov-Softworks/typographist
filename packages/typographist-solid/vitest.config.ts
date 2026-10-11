import { fileURLToPath } from 'node:url';

import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));
const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) };

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [solid()],
        resolve: { alias },
        test: {
          name: 'typographist-solid',
          root,
          globals: true,
          environment: 'node',
          include: ['src/**/*.spec.{ts,tsx}'],
          exclude: ['src/typographist-server.spec.tsx'],
        },
      },
      {
        plugins: [solid({ ssr: true })],
        resolve: { alias },
        test: {
          name: 'typographist-solid-server',
          root,
          globals: true,
          environment: 'node',
          include: ['src/typographist-server.spec.tsx'],
        },
      },
    ],
  },
});
