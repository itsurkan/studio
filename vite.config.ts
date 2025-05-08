import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      include: ['src/**'],
      exclude: ['src/types', 'src/test', 'src/main.tsx'],
      reporter: ['text', 'json', 'html'],
    }

  },
});