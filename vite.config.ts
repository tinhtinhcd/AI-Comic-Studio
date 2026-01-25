
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const target = process.env.TARGET || 'landing';
  const projectRoot = process.cwd();

  let root = projectRoot;
  let outDir = path.resolve(projectRoot, 'dist');
  let input: any = { main: path.resolve(projectRoot, 'index.html') };
  let base = '/'; 
  let emptyOutDir = true;

  // Build Configuration Logic
  if (target === 'reader') {
    root = path.resolve(projectRoot, 'src/reader');
    outDir = path.resolve(projectRoot, 'dist/reader'); 
    base = '/reader/'; 
    input = { main: path.resolve(projectRoot, 'src/reader/index.html') };
  } else if (target === 'studio') {
    root = path.resolve(projectRoot, 'src/studio');
    outDir = path.resolve(projectRoot, 'dist/studio');
    base = '/studio/'; 
    input = { main: path.resolve(projectRoot, 'src/studio/index.html') };
  } else if (target === 'admin') {
    root = path.resolve(projectRoot, 'src/admin');
    outDir = path.resolve(projectRoot, 'dist/admin');
    base = '/admin/';
    input = { main: path.resolve(projectRoot, 'src/admin/index.html') };
  } else if (target === 'landing') {
    root = projectRoot;
    outDir = path.resolve(projectRoot, 'dist');
    base = '/';
    input = { main: path.resolve(projectRoot, 'index.html') };
    // Landing page builds to root dist, we might want to avoid wiping other folders if running sequentially
    // But typically build:landing is part of full build. 
    // Careful with emptyOutDir here if running parallel.
    emptyOutDir = false; 
  }

  // Ensure output directory exists to prevent build failures
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY),
      'process.env.DEEPSEEK_API_KEY': JSON.stringify(process.env.DEEPSEEK_API_KEY || env.DEEPSEEK_API_KEY),
      'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY || env.OPENAI_API_KEY)
    },
    root: root,
    base: base,
    build: {
      outDir: outDir,
      emptyOutDir: emptyOutDir,
      rollupOptions: {
        input: input,
      },
    },
    server: {
      fs: {
        allow: [projectRoot]
      },
      configureServer(server) {
        const studioHtml = path.resolve(projectRoot, 'src/studio/index.html');
        const readerHtml = path.resolve(projectRoot, 'src/reader/index.html');
        const adminHtml = path.resolve(projectRoot, 'src/admin/index.html');

        const serveHtml = async (url: string, htmlPath: string, res: any) => {
          const html = fs.readFileSync(htmlPath, 'utf-8');
          const transformed = await server.transformIndexHtml(url, html);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.end(transformed);
        };

        server.middlewares.use(async (req, res, next) => {
          const url = req.url || '';

          if (url === '/studio' || url === '/studio/') {
            await serveHtml('/studio/', studioHtml, res);
            return;
          }
          if (url.startsWith('/studio/')) {
            req.url = url.replace('/studio', '/src/studio');
            return next();
          }

          if (url === '/reader' || url === '/reader/') {
            await serveHtml('/reader/', readerHtml, res);
            return;
          }
          if (url.startsWith('/reader/')) {
            req.url = url.replace('/reader', '/src/reader');
            return next();
          }

          if (url === '/admin' || url === '/admin/') {
            await serveHtml('/admin/', adminHtml, res);
            return;
          }
          if (url.startsWith('/admin/')) {
            req.url = url.replace('/admin', '/src/admin');
            return next();
          }

          return next();
        });
      }
    },
    resolve: {
        alias: {
            '@': path.resolve(projectRoot, 'src'),
            '@studio': path.resolve(projectRoot, 'src/studio'),
            '@reader': path.resolve(projectRoot, 'src/reader'),
            '@admin': path.resolve(projectRoot, 'src/admin')
        }
    }
  }
})
