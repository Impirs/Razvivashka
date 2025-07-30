
import { defineConfig, mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Overall common settings
const common = {
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    fs: { allow: ['..'] },
  },
  css: {
    modules: { scopeBehaviour: 'local' },
  },
};

// React JS (src)
const reactJsConfig = defineConfig({
  ...common,
  root: './src',
  build: {
    outDir: '../dist/js',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
});

// React TS (src_ts)
const reactTsConfig = defineConfig({
  ...common,
  root: './src_ts',
  build: {
    outDir: '../dist/ts',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src_ts'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
});

// export both of the configs for monorepo-like support
export default defineConfig(({ mode, command }) => {
  // avaliable to run vite --config vite.config.js --root src or --root src_ts
  // or use NODE_ENV/mode to select
  if (process.env.VITE_APP_TARGET === 'ts') {
    return reactTsConfig;
  }
  return reactJsConfig;
});