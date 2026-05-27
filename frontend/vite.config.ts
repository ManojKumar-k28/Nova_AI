import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // IMPORTANT FOR GITHUB PAGES
  base: '/Nova_AI/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  build: {
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 900,

    rollupOptions: {
      output: {
        manualChunks: {
          react: [
            'react',
            'react-dom',
            'react-router-dom'
          ],

          three: [
            'three',
            '@react-three/fiber',
            '@react-three/drei'
          ],

          motion: [
            'framer-motion',
            'gsap'
          ],

          markdown: [
            'react-markdown',
            'react-syntax-highlighter'
          ],

          api: [
            'axios',
            'zustand'
          ]
        }
      }
    }
  }
})