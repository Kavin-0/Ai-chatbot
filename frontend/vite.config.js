import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Use 127.0.0.1 (IPv4) not localhost — Node resolves localhost to ::1 (IPv6)
      // but FastAPI binds only to 127.0.0.1 (IPv4), causing ECONNREFUSED.
      '/auth': 'http://127.0.0.1:8000',
      '/chat': 'http://127.0.0.1:8000',
      '/upload': 'http://127.0.0.1:8000',
      '/history': 'http://127.0.0.1:8000',
      '/students': 'http://127.0.0.1:8000',
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
