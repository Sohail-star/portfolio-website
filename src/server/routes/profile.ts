import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { requireAdmin } from '../auth';

const router = Router();

// GET /api/profile (Public profile and services)
router.get('/', (_req: Request, res: Response): void => {
  const profile = db.getProfile();
  const services = db.getServices();
  res.json({
    success: true,
    data: {
      profile,
      services,
    },
  });
});

// POST /api/profile/upload-photo (Upload profile picture directly)
router.post('/upload-photo', (req: Request, res: Response): void => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ success: false, error: 'No image data provided' });
      return;
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ success: false, error: 'Invalid base64 image data' });
      return;
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const targetPath = path.join(imagesDir, 'sohail_portrait.png');
    fs.writeFileSync(targetPath, buffer);

    const newUrl = `/images/sohail_portrait.png?t=${Date.now()}`;
    const updated = db.updateProfile({ portraitUrl: newUrl });

    res.json({ success: true, data: { portraitUrl: newUrl, profile: updated } });
  } catch (err) {
    console.error('[Upload Photo Error]', err);
    res.status(500).json({ success: false, error: 'Failed to save photo' });
  }
});

// PATCH /api/admin/profile (Protected)
router.patch('/admin', requireAdmin, (req: Request, res: Response): void => {
  try {
    if (req.body.imageBase64) {
      const matches = req.body.imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64');
        const imagesDir = path.join(process.cwd(), 'public', 'images');
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }
        const targetPath = path.join(imagesDir, 'sohail_portrait.png');
        fs.writeFileSync(targetPath, buffer);
        req.body.portraitUrl = `/images/sohail_portrait.png?t=${Date.now()}`;
      }
      delete req.body.imageBase64;
    }

    const updated = db.updateProfile(req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[Update Profile Error]', err);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

export default router;
