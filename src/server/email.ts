export interface SendEmailOptions {
  to: string;
  fromName: string;
  subject: string;
  replyTo?: string;
  html: string;
  text: string;
}

export async function sendContactNotification(messageData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}): Promise<{ success: boolean; provider: string; messageId?: string; simulated?: boolean }> {
  const recipientEmail = process.env.CONTACT_NOTIFICATION_EMAIL || 'Sohailsk7882261@gmail.com';
  const resendApiKey = process.env.RESEND_API_KEY;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #020B1B; color: #F8FAFC; padding: 24px; border-radius: 8px;">
      <h2 style="color: #008CFF; border-bottom: 2px solid #008CFF; padding-bottom: 8px;">New Portfolio Contact Message</h2>
      <p style="color: #A9B9D0; font-size: 14px;">Received on ${new Date(messageData.createdAt).toLocaleString()}</p>
      
      <div style="background-color: #06162D; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid rgba(0, 140, 255, 0.2);">
        <p><strong>From:</strong> ${escapeHtml(messageData.name)} (${escapeHtml(messageData.email)})</p>
        ${messageData.phone ? `<p><strong>Phone:</strong> ${escapeHtml(messageData.phone)}</p>` : ''}
        <p><strong>Subject:</strong> ${escapeHtml(messageData.subject)}</p>
      </div>

      <div style="background-color: #0B1F3F; padding: 16px; border-radius: 6px; border-left: 4px solid #00CFFF;">
        <h4 style="margin-top: 0; color: #00CFFF;">Message:</h4>
        <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(messageData.message)}</p>
      </div>

      <p style="color: #64748B; font-size: 12px; margin-top: 24px;">Sent from Mohammad Sohail's Developer Portfolio Application</p>
    </div>
  `;

  const textContent = `
New Portfolio Contact Message
------------------------------------
From: ${messageData.name} (${messageData.email})
${messageData.phone ? `Phone: ${messageData.phone}\n` : ''}
Subject: ${messageData.subject}
Date: ${new Date(messageData.createdAt).toLocaleString()}

Message:
${messageData.message}
  `;

  // 1. Try Resend if configured
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: recipientEmail,
          reply_to: messageData.email,
          subject: `Portfolio Inquiry: ${messageData.subject} (from ${messageData.name})`,
          html: htmlContent,
          text: textContent,
        }),
      });

      if (response.ok) {
        const data = await response.json() as { id: string };
        console.log(`[Email] Successfully delivered via Resend. ID: ${data.id}`);
        return { success: true, provider: 'resend', messageId: data.id };
      } else {
        const errorText = await response.text();
        console.warn(`[Email] Resend API responded with error: ${errorText}`);
      }
    } catch (err) {
      console.error('[Email] Failed to send via Resend:', err);
    }
  }

  // 2. Local notification logging
  console.log(`[Email Notification Recorded] Notification for ${recipientEmail}: From ${messageData.name} <${messageData.email}> - "${messageData.subject}"`);
  return { success: true, provider: 'simulated_local', simulated: true };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
