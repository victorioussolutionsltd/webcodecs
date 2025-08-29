import tsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/utils/**/**.{ts,tsx,js,jsx}'],
    },
    globals: true,
    setupFiles: ['./setup-tests.ts'],
  },
  plugins: [tsConfigPaths()],
});
