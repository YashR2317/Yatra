import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Output to dist/ for production builds
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Proxy API calls to the unified Python/FastAPI server in development
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
