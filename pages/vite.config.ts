import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use root base in development so local server serves assets at '/'
  // Use repository base in production for GitHub Pages
  const base = mode === 'development' ? '/' : '/Razvivashka/'

  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    },
    server: {
      port: 3000,
      host: true,
      open: true,
    }
  }
})
