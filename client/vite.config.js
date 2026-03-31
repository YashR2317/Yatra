import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Output to server/public for production serving
    outDir: '../server/public/client',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Proxy API calls to the unified server in development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
