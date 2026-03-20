import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/oauth': {
        target: 'https://dev-1h0nu8s4gpsghldn.uk.auth0.com',
        changeOrigin: true,
      },
    },
  },
})
