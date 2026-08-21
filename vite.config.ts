import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.SPORTSRC_API_KEY ?? ''

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        // The browser only ever talks to /api. The dev server attaches the
        // API key server-side so it never reaches the client bundle.
        '/api': {
          target: 'https://api.sportsrc.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/v2'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('X-API-KEY', apiKey)
            })
          },
        },
      },
    },
  }
})
