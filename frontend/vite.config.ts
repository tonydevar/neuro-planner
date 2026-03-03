import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// VITE_API_TARGET allows overriding the proxy target in Docker:
//   - Local dev: http://localhost:8000  (default)
//   - Docker:    http://backend:8000    (set via docker-compose environment)
const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,  // bind to 0.0.0.0 so Docker can expose the port
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      }
    }
  }
})
