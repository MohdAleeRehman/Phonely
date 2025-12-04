import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            // React core libraries
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'form-vendor';
            }
            // Animation library
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            // Data fetching
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            // State management
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
            // Socket.io and engine.io
            if (id.includes('socket.io-client') || id.includes('engine.io')) {
              return 'socket-vendor';
            }
            // Axios and HTTP clients
            if (id.includes('axios')) {
              return 'http-vendor';
            }
            // Other node_modules - each gets its own chunk to avoid large bundles
            // This allows better caching and parallel loading
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500, // Increase limit since vendor bundle is acceptable size when gzipped
  },
})
