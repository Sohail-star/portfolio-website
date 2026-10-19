import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { requireAdmin } from '../auth';
import { sendContactNotification } from '../email';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().max(30).optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(150, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(3000, 'Message is too long'),
  honeypot: z.string().optional(), // anti-bot spam trap
});

// Simple in-memory rate limiting map (IP / email -> timestamp)
const recentSubmissions = new Map<string, number>();

// POST /api/contact (Public inquiry form submission)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error',
        details: parsed.error.issues,
      });
      return;
    }

    const { name, email, phone, subject, message, honeypot } = parsed.data;

    // Spam honeypot detection: bots fill hidden fields
    if (honeypot && honeypot.trim().length > 0) {
      // Quietly reject bots with 200 to not train them
      res.json({ success: true, message: 'Message received' });
      return;
    }

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const rateLimitKey = `${clientIp}-${email.toLowerCase()}`;
    const now = Date.now();
    const lastSubmission = recentSubmissions.get(rateLimitKey);

    // Rate limiting: prevent submitting more than once every 10 seconds
    if (lastSubmission && now - lastSubmission < 10000) {
      res.status(429).json({
        success: false,
        error: 'Please wait a moment before sending another message.',
      });
      return;
    }

    recentSubmissions.set(rateLimitKey, now);

    // Clean up old rate limit entries
    if (recentSubmissions.size > 1000) {
      for (const [key, ts] of recentSubmissions.entries()) {
        if (now - ts > 60000) recentSubmissions.delete(key);
      }
    }

    // 1. Dispatch email notification
    let emailSent = false;
    try {
      const emailResult = await sendContactNotification({
        name,
        email,
        phone,
        subject,
        message,
        createdAt: new Date().toISOString(),
      });
      emailSent = emailResult.success;
    } catch (mailErr) {
      console.error('[Contact Email Warning]', mailErr);
    }

    // 2. Persist message in database
    const savedMessage = db.createMessage({
      name,
      email,
      phone,
      subject,
      message,
      ipAddress: clientIp,
      emailSent,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. Mohammad Sohail will get back to you shortly.',
      data: {
        id: savedMessage.id,
        createdAt: savedMessage.createdAt,
      },
    });
  } catch (err) {
    console.error('[Contact Submission Error]', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while sending your message. Please try again or reach out directly via email.',
    });
  }
});

// GET /api/admin/messages (Protected: list messages with pagination & filters)
router.get('/admin', requireAdmin, (req: Request, res: Response): void => {
  try {
    const status = req.query.status as 'new' | 'read' | 'replied' | undefined;
    const search = req.query.search as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));

    const allFiltered = db.getMessages(status, search);
    const total = allFiltered.length;
    const startIndex = (page - 1) * limit;
    const paginated = allFiltered.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      data: paginated,
    });
  } catch (err) {
    console.error('[Admin Messages Error]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// PATCH /api/admin/messages/:id (Protected: update message status)
router.patch('/admin/:id', requireAdmin, (req: Request, res: Response): void => {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'replied'].includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status. Must be "new", "read", or "replied"' });
      return;
    }

    const updated = db.updateMessageStatus(req.params.id, status);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Message not found' });
      return;
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[Update Message Error]', err);
    res.status(500).json({ success: false, error: 'Failed to update message' });
  }
});

// DELETE /api/admin/messages/:id (Protected: delete message)
router.delete('/admin/:id', requireAdmin, (req: Request, res: Response): void => {
  try {
    const deleted = db.deleteMessage(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Message not found' });
      return;
    }

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error('[Delete Message Error]', err);
    res.status(500).json({ success: false, error: 'Failed to delete message' });
  }
});

// GET /api/admin/stats (Protected: dashboard metrics)
router.get('/admin/stats', requireAdmin, (_req: Request, res: Response): void => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('[Admin Stats Error]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

export default router;
