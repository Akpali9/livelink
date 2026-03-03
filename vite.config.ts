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
      external: ['fs', 'path', 'os', 'crypto', 'stream', 'buffer']
    }
  },
  optimizeDeps: {
    include: ['lucide-react', 'framer-motion']
  },
  assetsInclude: ['**/*.svg', '**/*.csv']
})
