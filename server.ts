import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createApiApp, attachApiErrorHandler } from './src/server/app';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createApiApp({ attachFallbackErrorHandlers: false });
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Serve static public downloads / assets
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Frontend integration
  if (!isProduction) {
    // Development mode: mount Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Centralized Error Handler
  attachApiErrorHandler(app);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Portfolio server running at http://0.0.0.0:${PORT}`);
    console.log(`⚡ API ready on http://0.0.0.0:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
