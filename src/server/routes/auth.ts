import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { verifyPassword, generateToken, requireAdmin, AuthRequest } from '../auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, error: parseResult.error.issues[0]?.message || 'Validation error' });
      return;
    }

    const { email, password } = parseResult.data;
    const user = db.findUserByEmail(email);

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const isValid = db.verifyAdminPassword(email, password);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[Auth Error]', err);
    res.status(500).json({ success: false, error: 'Internal server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', requireAdmin, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }
  const user = db.findUserByEmail(req.user.email);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/auth/change-password
router.post('/change-password', requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, error: parseResult.error.issues[0]?.message || 'Validation error' });
      return;
    }

    const { currentPassword, newPassword } = parseResult.data;
    const user = db.findUserByEmail(req.user.email);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const isMatch = db.verifyAdminPassword(user.email, currentPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, error: 'Current password is incorrect' });
      return;
    }

    db.updateUserPassword(user.email, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[Password Update Error]', err);
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
