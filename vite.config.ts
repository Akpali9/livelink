import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
    dedupe: ['react', 'react-dom']
  },
  build: {
    rollupOptions: {
      // Only Node-only modules, never frontend libraries
      external: ['fs', 'path', 'os', 'crypto', 'stream', 'buffer'],
      output: {
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
  optimizeDeps: {
    include: ['lucide-react'] // ensures Vite pre-bundles lucide-react
  },
  assetsInclude: ['**/*.svg', '**/*.csv']
})
