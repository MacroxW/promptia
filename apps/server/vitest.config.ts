import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        'src/index.ts',
        'src/scripts/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@promptia/schemas': path.resolve(__dirname, '../../packages/schemas/src/index.ts'),
      '@promptia/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@promptia/utils': path.resolve(__dirname, './src/utils/src/index.ts'),
      '@promptia/database': path.resolve(__dirname, './database/src/client.ts'),
      '@promptia/constants': path.resolve(__dirname, '../../packages/constants/src/index.ts'),
    },
  },
});
