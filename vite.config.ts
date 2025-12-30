import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Critical: This replaces 'process.env.API_KEY' in your code with the actual key from Cloudflare
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY)
    },
    // CRITICAL FIX: The environment enforces an index.html with an importmap pointing to CDN.
    // We must exclude these libraries from the local bundle to prevent "Dual React" conflicts.
    build: {
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react-dom/client',
          '@google/genai',
          'lucide-react',
          'jszip',
          '@ffmpeg/ffmpeg',
          '@ffmpeg/util'
        ]
      }
    },
    // Prevent Vite from pre-bundling these, forcing the browser to use the importmap
    optimizeDeps: {
      exclude: [
          'react',
          'react-dom',
          '@google/genai',
          'lucide-react',
          'jszip',
          '@ffmpeg/ffmpeg',
          '@ffmpeg/util'
      ]
    }
  }
})