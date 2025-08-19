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
      sourcemap: false,
      rollupOptions: {
        output: {
          // Force new filenames for cache busting
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      }
    },
    server: {
      port: 3000,
      host: true,
      open: true,
    }
  }
})
