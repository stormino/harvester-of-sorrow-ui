import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (_proxyRes, req, res) => {
            // Prevent Vite's proxy from buffering SSE responses
            if (req.url?.includes('/stream')) {
              res.setHeader('Cache-Control', 'no-cache');
              res.setHeader('X-Accel-Buffering', 'no');
            }
          });
        },
      },
    },
  },
})
