import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from network
    port: 5173,
    proxy: {
      // Proxy API requests to the backend server during development
      '/api': {
        target: 'http://api:8000', // Target the backend service name in docker-compose
        changeOrigin: true,
        // secure: false, // Uncomment if backend uses self-signed cert
        // rewrite: (path) => path.replace(/^\/api/, '') // Optional: if backend doesn't expect /api prefix
      },
    },
  },
})
