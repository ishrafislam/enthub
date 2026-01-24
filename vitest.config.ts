import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    'import.meta.env.VITE_CONVEX_URL': JSON.stringify('https://test.convex.cloud'),
    'import.meta.env.VITE_TMDB_READ_TOKEN': JSON.stringify('test-token'),
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'convex/_generated/',
        '**/*.d.ts',
        '**/*.config.ts',
      ],
    },
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
