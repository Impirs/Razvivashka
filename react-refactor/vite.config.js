import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
<<<<<<< Updated upstream
    root: './',
=======
    root: '.',
    server: {
        port: 5173,
    },
>>>>>>> Stashed changes
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@shared': path.resolve(__dirname, '../shared'),
        },
    }
});