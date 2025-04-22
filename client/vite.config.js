import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import cartographer from '@replit/vite-plugin-cartographer';
import errorModal from '@replit/vite-plugin-runtime-error-modal';
import shadcnThemeJson from '@replit/vite-plugin-shadcn-theme-json';

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  
  return {
    plugins: [
      react(),
      cartographer(),
      errorModal({ hideResetDeps: true }),
      shadcnThemeJson(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, '../attached_assets'),
      },
    },
    // Configure server to work with Replit
    server: {
      hmr: {
        // Use secure protocol based on site
        protocol: 'wss',
        // This prevents the undefined port issue
        clientPort: 443,
        // Disable port detection that causes issues
        port: null,
        // More lenient for reconnection
        timeout: 5000
      },
      // For Replit to proxy correctly
      strictPort: true
    },
    // Clear console on restart to reduce noise
    clearScreen: true
  };
});