import { Resend } from 'resend';

export interface SendEmailOptions {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  ipAddress?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  provider: 'resend' | 'simulated_dev';
  messageId?: string;
  error?: string;
  details?: any;
}

const DEFAULT_RECIPIENT = 'sohailsk7882261@gmail.com';
const DEFAULT_SENDER = 'Portfolio Contact <onboarding@resend.dev>';

/**
 * Sends a contact form notification email using Resend.
 * Strictly verifies the Resend API response and reports actual delivery status.
 */
export async function sendContactNotification(
  data: SendEmailOptions
): Promise<EmailDeliveryResult> {
  const recipientEmail =
    process.env.CONTACT_RECIPIENT_EMAIL ||
    process.env.CONTACT_NOTIFICATION_EMAIL ||
    DEFAULT_RECIPIENT;

  const senderEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_SENDER;
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  const formattedDate = new Date(data.createdAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Inquiry</title>
      <style>
        body { margin: 0; padding: 0; background-color: #020B1B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F8FAFC; }
        .wrapper { width: 100%; max-width: 620px; margin: 0 auto; padding: 28px 16px; }
        .card { background-color: #06162D; border: 1px solid #008CFF33; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
        .header { background: linear-gradient(135deg, #008CFF, #00CFFF); padding: 24px; text-align: left; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.9); }
        .body { padding: 24px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 8px 10px; font-size: 14px; vertical-align: top; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
        .info-table .label { width: 110px; color: #A9B9D0; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
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
            <p>From Mohammad Sohail Portfolio Contact Form</p>
          </div>
          <div class="body">
            <table class="info-table">
              <tr>
                <td class="label">Client Name:</td>
                <td class="value"><strong>${escapeHtml(data.name)}</strong></td>
              </tr>
              <tr>
                <td class="label">Email:</td>
                <td class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #00CFFF; text-decoration: none;">${escapeHtml(data.email)}</a></td>
              </tr>
              ${data.phone ? `
              <tr>
                <td class="label">Phone:</td>
                <td class="value"><a href="tel:${escapeHtml(data.phone)}" style="color: #00CFFF; text-decoration: none;">${escapeHtml(data.phone)}</a></td>
              </tr>
              ` : ''}
              <tr>
                <td class="label">Subject:</td>
                <td class="value">${escapeHtml(data.subject)}</td>
              </tr>
              <tr>
                <td class="label">Date:</td>
                <td class="value">${escapeHtml(formattedDate)}</td>
              </tr>
            </table>

            <div class="message-box">
              <div class="message-title">Client Message</div>
              <p class="message-text">${escapeHtml(data.message)}</p>
            </div>

            <div style="text-align: center;">
              <a href="mailto:${escapeHtml(data.email)}?subject=Re:%20${encodeURIComponent(data.subject)}" class="reply-button">Reply Directly to Client</a>
            </div>
          </div>
          <div class="footer">
            Delivered securely to ${escapeHtml(recipientEmail)} &bull; Reply-To set to ${escapeHtml(data.email)}
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
From: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}\n` : ''}Subject: ${data.subject}
Date: ${formattedDate}

Message:
${data.message}

--------------------------------------------------
Reply directly to this email to respond to ${data.name} (${data.email}).
Delivered to: ${recipientEmail}
  `.trim();

  // If RESEND_API_KEY is not configured
  if (!resendApiKey) {
    const errorMsg =
      'RESEND_API_KEY environment variable is missing. Please add your Resend API key to Vercel Environment Variables (or .env) to enable email delivery to ' +
      recipientEmail;
    console.error(`[Email Service Error] ${errorMsg}`);

    // In local development, if no key is present, log diagnostic
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[Email Dev Mode] Simulated delivery because RESEND_API_KEY is not set. In production, this request will fail with 503.`
      );
      return {
        success: true,
        provider: 'simulated_dev',
        messageId: `dev-sim-${Date.now()}`,
      };
    }

    return {
      success: false,
      provider: 'resend',
      error: errorMsg,
    };
  }

  // Send using Resend SDK / API
  try {
    const resend = new Resend(resendApiKey);

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: senderEmail,
      to: [recipientEmail],
      replyTo: data.email,
      subject: `Portfolio Inquiry: ${data.subject} (from ${data.name})`,
      html: htmlContent,
      text: textContent,
    });

    if (resendError) {
      console.error('[Resend Delivery Error]', resendError);
      return {
        success: false,
        provider: 'resend',
        error: resendError.message || 'Resend rejected the email delivery request.',
        details: resendError,
      };
    }

    console.log(`[Resend Success] Email delivered. ID: ${resendData?.id}`);
    return {
      success: true,
      provider: 'resend',
      messageId: resendData?.id,
    };
  } catch (err: any) {
    console.error('[Resend Network/Exception Error]', err);
    return {
      success: false,
      provider: 'resend',
      error: err.message || 'An error occurred while communicating with Resend email service.',
    };
  }
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
