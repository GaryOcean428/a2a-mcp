import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src'),
      '@assets': resolve(__dirname, './attached_assets'),
      '@shared': resolve(__dirname, './shared'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'client/index.html'),
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['zod', 'wouter', 'clsx', 'date-fns'],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
