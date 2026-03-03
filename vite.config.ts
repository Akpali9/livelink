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
      // Only externalize Node modules or server-side packages
      external: [
        'fs',
        'path',
        'os',
        'crypto',
        'stream',
        'buffer',
      ],
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
