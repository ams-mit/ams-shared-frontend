import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Group 2 services have no CORS config, so dev requests go through Vite.
      '/lease-occupancy-api': {
        target: process.env.LEASE_SERVICE_URL || 'http://localhost:8084',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lease-occupancy-api/, ''),
      },
      '/property-unit-api': {
        target: process.env.PROPERTY_SERVICE_URL || 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/property-unit-api/, ''),
      },
    },
  },
});
