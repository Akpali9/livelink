import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      // leave empty: frontend libraries should NOT be externalized
      external: []
    }
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
