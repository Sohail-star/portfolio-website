import 'dotenv/config';
import { apiApp } from '../src/server/app';

/**
 * Unified Vercel Serverless entrypoint for all /api/* routes
 * (auth, projects, skills, contact, profile, reviews, cv, health).
 */
export default function handler(req: any, res: any) {
  try {
    const rawUrl: string = req.url || '/';
    const parsedUrl = new URL(rawUrl, 'http://localhost');
    const rewrittenPath = parsedUrl.searchParams.get('__path');

    if (rewrittenPath !== null) {
      parsedUrl.searchParams.delete('__path');
      const cleanPath = rewrittenPath.replace(/^\/+/, '');
      const queryString = parsedUrl.searchParams.toString();
      req.url = `/api/${cleanPath}${queryString ? `?${queryString}` : ''}`;
    } else if (!parsedUrl.pathname.startsWith('/api')) {
      const cleanPath = parsedUrl.pathname.replace(/^\/+/, '');
      const queryString = parsedUrl.searchParams.toString();
      req.url = `/api/${cleanPath}${queryString ? `?${queryString}` : ''}`;
    }
  } catch {
    // Fallback if URL parsing fails
    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }
  }

  return apiApp(req, res);
}
