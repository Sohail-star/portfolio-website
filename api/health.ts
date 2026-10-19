import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(_req: IncomingMessage, res: ServerResponse & { json?: (body: any) => void }) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const payload = {
    status: 'healthy',
    service: 'Mohammad Sohail Portfolio API (Vercel Serverless)',
    timestamp: new Date().toISOString(),
    resendConfigured: !!process.env.RESEND_API_KEY,
    recipientEmail:
      process.env.CONTACT_RECIPIENT_EMAIL ||
      process.env.CONTACT_NOTIFICATION_EMAIL ||
      'sohailsk7882261@gmail.com',
  };
  res.end(JSON.stringify(payload));
}
