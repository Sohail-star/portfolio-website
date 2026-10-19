import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { requireAdmin } from '../auth';

const router = Router();

const publicReviewSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().min(2, 'Role/Title must be at least 2 characters'),
  quote: z.string().min(5, 'Review message must be at least 5 characters'),
  rating: z.number().min(1).max(5).default(5),
});

const adminReviewSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  quote: z.string().min(1, 'Message is required'),
  rating: z.number().min(1).max(5).default(5),
  published: z.boolean().optional().default(true),
  avatarUrl: z.string().optional(),
});

// GET /api/reviews (public published reviews)
router.get('/', (_req: Request, res: Response): void => {
  const reviews = db.getReviews(true);
  res.json({ success: true, count: reviews.length, data: reviews });
});

// POST /api/reviews (public submission)
router.post('/', (req: Request, res: Response): void => {
  try {
    const parsed = publicReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid review data',
      });
      return;
    }

    const created = db.createReview({
      ...parsed.data,
      published: true, // visible on portfolio
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('[Submit Review Error]', err);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
});

// GET /api/reviews/admin/all (admin - all reviews with search & filter)
router.get('/admin/all', requireAdmin, (req: Request, res: Response): void => {
  try {
    const search = req.query.search as string | undefined;
    const rating = req.query.rating ? Number(req.query.rating) : undefined;
    const status = (req.query.status as 'all' | 'published' | 'unpublished') || 'all';

    const reviews = db.getReviews(false, search, rating, status);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    console.error('[Get Admin Reviews Error]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews/admin (admin - create review)
router.post('/admin', requireAdmin, (req: Request, res: Response): void => {
  try {
    const parsed = adminReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid review data',
      });
      return;
    }

    const created = db.createReview(parsed.data);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('[Admin Create Review Error]', err);
    res.status(500).json({ success: false, error: 'Failed to create review' });
  }
});

// PATCH /api/reviews/admin/:id (admin - update review)
router.patch('/admin/:id', requireAdmin, (req: Request, res: Response): void => {
  try {
    const updated = db.updateReview(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Review not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[Admin Update Review Error]', err);
    res.status(500).json({ success: false, error: 'Failed to update review' });
  }
});

// PATCH /api/reviews/admin/:id/toggle-publish (admin - toggle published status)
router.patch('/admin/:id/toggle-publish', requireAdmin, (req: Request, res: Response): void => {
  try {
    const updated = db.togglePublishReview(req.params.id);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Review not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[Admin Toggle Publish Error]', err);
    res.status(500).json({ success: false, error: 'Failed to toggle review status' });
  }
});

// DELETE /api/reviews/admin/:id (admin - delete review)
router.delete('/admin/:id', requireAdmin, (req: Request, res: Response): void => {
  try {
    const deleted = db.deleteReview(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Review not found' });
      return;
    }
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('[Admin Delete Review Error]', err);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});

export default router;
