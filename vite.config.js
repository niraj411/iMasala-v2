// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/wp-json': {
        target: 'https://tandoorikitchenco.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})