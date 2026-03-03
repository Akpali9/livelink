import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      // Only externalize Node-only packages that are NOT needed in the browser
      external: [
        'fs',      // Node file system
        'path',    // Node path utilities
        'os',      // Node OS info
        'crypto',  // Node crypto
        'stream',  // Node streams
        'buffer'   // Node buffer
      ],
      output: {
        // Preserve import statements for externalized modules
        globals: {
          fs: 'fs',
          path: 'path',
          os: 'os',
          crypto: 'crypto',
          stream: 'stream',
          buffer: 'buffer'
        }
      }
    }
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
