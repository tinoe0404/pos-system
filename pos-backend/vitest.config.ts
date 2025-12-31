import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    setupFiles: ['./src/test-setup.ts'],
    pool: 'forks', // Run in separate processes
    poolOptions: {
      forks: {
        singleFork: true, // Run tests sequentially to avoid queue conflicts
      },
    },
    testTimeout: 30000, // Increase timeout for worker processing
  },
});