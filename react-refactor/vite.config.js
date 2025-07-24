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
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@shared': path.resolve(__dirname, '../shared'),
        },
    },
    css: {
        modules: {
            scopeBehaviour: "local",
        },
    },
});