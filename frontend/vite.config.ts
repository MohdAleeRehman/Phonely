import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Brotli and Gzip compression for all assets
    compression({
      include: [/\.(js|css|html|svg|json)$/],
      threshold: 1024, // Only compress files larger than 1KB
    }),
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
    // Enable minification with esbuild (faster than terser)
    minify: 'esbuild',
    // Optimize CSS
    cssMinify: true,
    cssCodeSplit: true,
    // Enable source maps for debugging (disable in production if not needed)
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: 'es2020',
    rollupOptions: {
      output: {
        // Optimize chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            // React core libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'form-vendor';
            }
            // Animation library (largest - keep separate)
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
      // Tree-shaking optimization
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Ensure assets are optimized
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'axios',
      'socket.io-client',
    ],
    exclude: ['framer-motion'], // Large library, keep separate
  },
})
