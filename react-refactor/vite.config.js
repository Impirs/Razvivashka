import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    base: './',
    plugins: [react()],
    root: '.',
    server: {
        port: 5173,
        fs: {
            allow: ['..'],
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    // assetsInclude: ['**/*.json'],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src_ts'),
            '@shared': path.resolve(__dirname, '../shared'),
            // '@translations': path.resolve(__dirname, './src_ts/translations'),
        },
    },
    css: {
        modules: {
            scopeBehaviour: "local",
        },
    },
});