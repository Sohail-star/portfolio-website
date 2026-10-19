import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './src/server/routes/auth';
import projectRoutes from './src/server/routes/projects';
import skillRoutes from './src/server/routes/skills';
import contactRoutes from './src/server/routes/contact';
import profileRoutes from './src/server/routes/profile';
import reviewRoutes from './src/server/routes/reviews';
import { db } from './src/server/db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Initialize persistent database
  db.init();

  // Basic security and parsing middleware
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Request logging in development
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });

  // Public health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'Mohammad Sohail Portfolio API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // REST API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/reviews', reviewRoutes);

  // High-fidelity CV PDF download endpoint (serves complete, embedded-font PDF)
  app.get(['/api/cv/download', '/downloads/Mohammad_Sohail_Resume.pdf'], async (_req: Request, res: Response) => {
    try {
      const { generateResumePdf } = await import('./src/server/cv-generator');
      const pdfBytes = await generateResumePdf();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="Mohammad_Sohail_Resume.pdf"');
      res.setHeader('Content-Length', pdfBytes.length);
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.send(Buffer.from(pdfBytes));
    } catch (err) {
      console.error('[CV Download Server Error]', err);
      const fallbackPath = path.resolve(__dirname, 'public/downloads/Mohammad_Sohail_Resume.pdf');
      if (fs.existsSync(fallbackPath)) {
        res.download(fallbackPath, 'Mohammad_Sohail_Resume.pdf');
      } else {
        res.status(500).json({ success: false, error: 'Failed to generate CV PDF' });
      }
    }
  });

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
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Unhandled Server Error]', err);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred',
      message: isProduction ? undefined : err.message,
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Portfolio server running at http://0.0.0.0:${PORT}`);
    console.log(`⚡ API ready on http://0.0.0.0:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
