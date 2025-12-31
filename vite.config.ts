
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import process from 'node:process'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // DEFAULT TO LANDING PAGE (Ecosystem) if TARGET is not set
  const target = process.env.TARGET || 'landing';
  const projectRoot = process.cwd();

  let root = projectRoot;
  let outDir = resolve(projectRoot, 'dist');
  let input: any = { main: resolve(projectRoot, 'index.html') };
  let base = '/'; 

  // LOGIC: Configure build paths based on TARGET
  if (target === 'reader') {
    root = resolve(projectRoot, 'src/reader');
    outDir = resolve(projectRoot, 'dist/reader'); 
    base = '/reader/'; 
    input = { main: resolve(projectRoot, 'src/reader/index.html') };
  } else if (target === 'studio') {
    root = resolve(projectRoot, 'src/studio');
    outDir = resolve(projectRoot, 'dist/studio');
    base = '/studio/'; 
    input = { main: resolve(projectRoot, 'src/studio/index.html') };
  } else if (target === 'admin') {
    root = resolve(projectRoot, 'src/admin');
    outDir = resolve(projectRoot, 'dist/admin');
    base = '/admin/';
    input = { main: resolve(projectRoot, 'src/admin/index.html') };
  } else if (target === 'landing') {
    root = projectRoot;
    outDir = resolve(projectRoot, 'dist');
    base = '/';
    input = { main: resolve(projectRoot, 'index.html') };
  } else {
    // Fallback
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
    root: root,
    base: base,
    build: {
      outDir: outDir,
      emptyOutDir: true, 
      rollupOptions: {
        input: input,
      },
    },
    server: {
      fs: {
        allow: [projectRoot]
      }
    },
    resolve: {
        alias: {
            '@': resolve(projectRoot, 'src')
        }
    }
  }
})