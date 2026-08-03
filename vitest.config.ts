import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  root: '.',
  esbuild: {
    loader: 'ts',
    include: ['lib/**/*.ts', 'src/**/*.ts', 'components/**/*.ts', 'components/**/*.tsx'],
    exclude: [],
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'lib/**/*.test.ts',
      'lib/**/*.spec.ts',
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'components/**/*.test.ts',
      'components/**/*.test.tsx',
    ],
    exclude: ['node_modules', 'dist', '.next'],
    setupFiles: ['lib/amexan/identity/__tests__/setup.ts'],
    testTimeout: 30000,
    reporters: ['verbose'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
