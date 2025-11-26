import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:80',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  preview: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:80',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});