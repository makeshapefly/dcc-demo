import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const auth0Origin = new URL(env.VITE_AUTH0_TOKEN_URL).origin

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/oauth': {
          target: auth0Origin,
          changeOrigin: true,
        },
      },
    },
  }
})
