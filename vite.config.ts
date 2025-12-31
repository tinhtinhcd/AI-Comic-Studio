
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // TARGET env var determines which app to build.
  const target = process.env.TARGET || 'landing';
  const projectRoot = __dirname;

  let root = projectRoot;
  let outDir = resolve(projectRoot, 'dist');
  let input: any = { main: resolve(projectRoot, 'index.html') };
  let base = '/'; 

  // LOGIC: Each target maps to a sub-folder in src/
  if (target === 'studio') {
    root = resolve(projectRoot, 'src/studio');
    outDir = resolve(projectRoot, 'dist/studio');
    base = '/studio/'; 
    // Vite will look for index.html inside src/studio/
    input = { main: resolve(projectRoot, 'src/studio/index.html') };
  } else if (target === 'reader') {
    root = resolve(projectRoot, 'src/reader');
    outDir = resolve(projectRoot, 'dist/reader');
    base = '/reader/';
    input = { main: resolve(projectRoot, 'src/reader/index.html') };
  } else if (target === 'admin') {
    root = resolve(projectRoot, 'src/admin');
    outDir = resolve(projectRoot, 'dist/admin');
    base = '/admin/';
    input = { main: resolve(projectRoot, 'src/admin/index.html') };
  } else {
    // Landing page (default root build)
    root = projectRoot;
    outDir = resolve(projectRoot, 'dist');
    base = '/';
    input = { main: resolve(projectRoot, 'index.html') };
  }

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY)
    },
    root: root, // Sets the root context for Vite
    base: base, // Sets the URL base path (e.g., /studio/)
    build: {
      outDir: outDir,
      emptyOutDir: true, 
      rollupOptions: {
        input: input,
      },
    },
    server: {
      fs: {
        allow: [projectRoot] // Allow serving files from root node_modules
      }
    },
    resolve: {
        alias: {
            '@': resolve(projectRoot, 'src')
        }
    }
  }
})
