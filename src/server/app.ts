import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { db } from './db';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import skillRoutes from './routes/skills';
import contactRoutes from './routes/contact';
import profileRoutes from './routes/profile';
import reviewRoutes from './routes/reviews';
import { generateResumePdf } from './cv-generator';

export interface CreateApiAppOptions {
  attachFallbackErrorHandlers?: boolean;
}

export function createApiApp(options: CreateApiAppOptions = {}): Express {
  const { attachFallbackErrorHandlers = true } = options;
  const app = express();

  // Initialize persistent database
  db.init();

  // Standard Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request Logger Middleware for API routes
  app.use('/api', (req: Request, _res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
  });

  // Health Check Route
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'Mohammad Sohail Portfolio API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Dynamic ATS Resume PDF Download Route
  const handleCvDownload = async (_req: Request, res: Response) => {
    try {
      const pdfBytes = await generateResumePdf();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="Mohammad_Sohail_Resume.pdf"');
      res.setHeader('Content-Length', pdfBytes.length);
      res.send(Buffer.from(pdfBytes));
    } catch (err) {
      console.error('[CV PDF Generation Error]', err);
      const fallbackPath = path.resolve(process.cwd(), 'public/downloads/Mohammad_Sohail_Resume.pdf');
      res.download(fallbackPath, 'Mohammad_Sohail_Resume.pdf');
    }
  };

  app.get('/api/cv/download', handleCvDownload);
  app.get('/downloads/Mohammad_Sohail_Resume.pdf', handleCvDownload);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/reviews', reviewRoutes);

  // 404 Handler for unknown API routes (always returns JSON, never HTML/text)
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `API route ${req.method} ${req.originalUrl} not found`,
    });
  });

  if (attachFallbackErrorHandlers) {
    attachApiErrorHandler(app);
  }

  return app;
}

export function attachApiErrorHandler(app: Express): void {
  const isProduction = process.env.NODE_ENV === 'production';
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Unhandled Server Error]', err);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred',
      message: isProduction ? undefined : err.message,
    });
  });
}

export const apiApp = createApiApp({ attachFallbackErrorHandlers: true });
