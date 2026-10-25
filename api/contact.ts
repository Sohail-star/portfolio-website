import type { IncomingMessage, ServerResponse } from 'http';
import { Resend } from 'resend';
import { db } from '../src/server/db';
import { apiApp } from '../src/server/app';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: any) => VercelResponse;
  send: (body: any) => VercelResponse;
}

// In-memory rate limiting map for duplicate prevention
const recentSubmissions = new Map<string, number>();

function sendJsonResponse(res: any, statusCode: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Delegate admin contact endpoints (/api/contact/admin/*) or non-POST requests to unified Express API app
  if (req.url?.includes('/admin') || req.method !== 'POST') {
    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api/contact${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }
    return apiApp(req as any, res as any);
  }

  try {
    // 2. Parse body if needed
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return sendJsonResponse(res, 400, {
          success: false,
          error: 'Invalid JSON request body.',
        });
      }
    } else if (!body && req.readable) {
      const chunks: Uint8Array[] = [];
      for await (const chunk of req as any) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const rawText = Buffer.concat(chunks).toString('utf-8');
      try {
        body = JSON.parse(rawText || '{}');
      } catch {
        return sendJsonResponse(res, 400, {
          success: false,
          error: 'Failed to parse JSON body from incoming stream.',
        });
      }
    }

    body = body || {};
    const { name, email, phone, subject, message, honeypot } = body;

    // 3. Spam honeypot trap
    if (honeypot && String(honeypot).trim().length > 0) {
      return sendJsonResponse(res, 200, {
        success: true,
        message: 'Message received successfully.',
      });
    }

    // 4. Form validation
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
    const trimmedSubject = typeof subject === 'string' ? subject.trim() : '';
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!trimmedName || trimmedName.length < 2) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Please provide your full name (at least 2 characters).',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Please enter a valid email address.',
      });
    }

    if (!trimmedSubject || trimmedSubject.length < 3) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Please enter a subject (at least 3 characters).',
      });
    }

    if (!trimmedMessage || trimmedMessage.length < 10) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Please enter a message of at least 10 characters.',
      });
    }

    // 5. Duplicate and rate limiting prevention
    const forwardedHeader = req.headers['x-forwarded-for'];
    const clientIp = Array.isArray(forwardedHeader)
      ? forwardedHeader[0]
      : typeof forwardedHeader === 'string'
      ? forwardedHeader.split(',')[0].trim()
      : req.socket?.remoteAddress || 'unknown';

    const rateKey = `${clientIp}-${trimmedEmail.toLowerCase()}`;
    const now = Date.now();
    const lastTime = recentSubmissions.get(rateKey);

    if (lastTime && now - lastTime < 10000) {
      return sendJsonResponse(res, 429, {
        success: false,
        error: 'Duplicate or too frequent submission. Please wait a moment before sending another message.',
      });
    }
    recentSubmissions.set(rateKey, now);

    // Clean up old entries
    if (recentSubmissions.size > 1000) {
      for (const [key, ts] of recentSubmissions.entries()) {
        if (now - ts > 60000) recentSubmissions.delete(key);
      }
    }

    // 6. Recipient and sender setup
    const recipientEmail =
      process.env.CONTACT_RECIPIENT_EMAIL ||
      process.env.CONTACT_NOTIFICATION_EMAIL ||
      'sohailsk7882261@gmail.com';

    const senderEmail = process.env.RESEND_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';
    const resendApiKey = process.env.RESEND_API_KEY?.trim();

    if (!resendApiKey) {
      const configErrMsg =
        'RESEND_API_KEY is not configured in Vercel Environment Variables. Please go to Vercel Project Settings -> Environment Variables, add RESEND_API_KEY, and redeploy.';
      console.error(`[Vercel Serverless Contact] ${configErrMsg}`);
      return sendJsonResponse(res, 503, {
        success: false,
        error: configErrMsg,
      });
    }

    // 7. Format email template
    const formattedDate = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Portfolio Contact Message</title>
        <style>
          body { margin: 0; padding: 0; background-color: #020B1B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F8FAFC; }
          .wrapper { width: 100%; max-width: 620px; margin: 0 auto; padding: 28px 16px; }
          .card { background-color: #06162D; border: 1px solid rgba(0, 140, 255, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #008CFF, #00CFFF); padding: 24px; text-align: left; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; }
          .header p { margin: 6px 0 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.9); }
          .body { padding: 24px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .info-table td { padding: 9px 10px; font-size: 14px; vertical-align: top; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
          .info-table .label { width: 120px; color: #A9B9D0; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          .info-table .value { color: #F8FAFC; font-weight: 500; }
          .message-box { background-color: #0B1F3F; border-left: 4px solid #00CFFF; border-radius: 8px; padding: 18px; margin-top: 16px; }
          .message-title { font-size: 12px; font-weight: 700; color: #00CFFF; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; }
          .message-text { font-size: 14px; line-height: 1.65; color: #F8FAFC; white-space: pre-wrap; word-break: break-word; margin: 0; }
          .reply-button { display: inline-block; margin-top: 24px; padding: 12px 24px; background: linear-gradient(135deg, #008CFF, #00CFFF); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
          .footer { text-align: center; padding: 20px 24px; font-size: 12px; color: #64748B; border-top: 1px solid rgba(255, 255, 255, 0.06); }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <h1>New Client Inquiry</h1>
              <p>Mohammad Sohail Portfolio &bull; Verified Contact Submission</p>
            </div>
            <div class="body">
              <table class="info-table">
                <tr>
                  <td class="label">Client Name:</td>
                  <td class="value"><strong>${escapeHtml(trimmedName)}</strong></td>
                </tr>
                <tr>
                  <td class="label">Email Address:</td>
                  <td class="value"><a href="mailto:${escapeHtml(trimmedEmail)}" style="color: #00CFFF; text-decoration: none;">${escapeHtml(trimmedEmail)}</a></td>
                </tr>
                ${trimmedPhone ? `
                <tr>
                  <td class="label">Phone Number:</td>
                  <td class="value"><a href="tel:${escapeHtml(trimmedPhone)}" style="color: #00CFFF; text-decoration: none;">${escapeHtml(trimmedPhone)}</a></td>
                </tr>
                ` : ''}
                <tr>
                  <td class="label">Subject:</td>
                  <td class="value">${escapeHtml(trimmedSubject)}</td>
                </tr>
                <tr>
                  <td class="label">Received On:</td>
                  <td class="value">${escapeHtml(formattedDate)}</td>
                </tr>
              </table>

              <div class="message-box">
                <div class="message-title">Client Message</div>
                <p class="message-text">${escapeHtml(trimmedMessage)}</p>
              </div>

              <div style="text-align: center;">
                <a href="mailto:${escapeHtml(trimmedEmail)}?subject=Re:%20${encodeURIComponent(trimmedSubject)}" class="reply-button">
                  Reply Directly to Client
                </a>
              </div>
            </div>
            <div class="footer">
              Delivered to ${escapeHtml(recipientEmail)} via Resend &bull; Reply-To set to ${escapeHtml(trimmedEmail)}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
New Client Inquiry
Mohammad Sohail Portfolio Contact Form
--------------------------------------------------
From: ${trimmedName}
Email: ${trimmedEmail}
${trimmedPhone ? `Phone: ${trimmedPhone}\n` : ''}Subject: ${trimmedSubject}
Date: ${formattedDate}

Message:
${trimmedMessage}

--------------------------------------------------
Reply directly to this email to respond to ${trimmedName} (${trimmedEmail}).
Delivered to: ${recipientEmail}
    `.trim();

    // 8. Dispatch via Resend
    const resend = new Resend(resendApiKey);

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: senderEmail,
      to: [recipientEmail],
      replyTo: trimmedEmail,
      subject: `Portfolio Inquiry: ${trimmedSubject} (from ${trimmedName})`,
      html: htmlContent,
      text: textContent,
    });

    if (resendError) {
      console.error('[Resend Error]', resendError);
      return sendJsonResponse(res, 502, {
        success: false,
        error: `Email delivery failed: ${resendError.message || 'Resend rejected the submission'}`,
        details: resendError,
      });
    }

    const savedMessage = db.createMessage({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      subject: trimmedSubject,
      message: trimmedMessage,
      ipAddress: clientIp,
      emailSent: true,
    });

    console.log(`[Vercel Serverless Contact] Successfully sent email. ID: ${resendData?.id}`);

    return sendJsonResponse(res, 201, {
      success: true,
      message: 'Thank you! Your message has been sent successfully to Mohammad Sohail.',
      data: {
        id: savedMessage.id,
        messageId: resendData?.id,
        recipient: recipientEmail,
        createdAt: savedMessage.createdAt,
      },
    });
  } catch (err: any) {
    console.error('[Vercel Serverless Contact Error]', err);
    return sendJsonResponse(res, 500, {
      success: false,
      error:
        err.message ||
        'An unexpected server error occurred while processing your message. Please reach out directly to sohailsk7882261@gmail.com.',
    });
  }
}
