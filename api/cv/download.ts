import type { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import fs from 'fs';
import { generateResumePdf } from '../../src/server/cv-generator';

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  try {
    const pdfBytes = await generateResumePdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Mohammad_Sohail_Resume.pdf"');
    res.setHeader('Content-Length', pdfBytes.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.end(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('[Vercel CV Download Error]', err);
    const fallbackPath = path.resolve(process.cwd(), 'public/downloads/Mohammad_Sohail_Resume.pdf');
    if (fs.existsSync(fallbackPath)) {
      const fileBuffer = fs.readFileSync(fallbackPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="Mohammad_Sohail_Resume.pdf"');
      res.setHeader('Content-Length', fileBuffer.length);
      res.end(fileBuffer);
    } else {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Failed to generate CV PDF' }));
    }
  }
}
