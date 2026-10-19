import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { requireAdmin } from '../auth';

const router = Router();

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.enum(['frontend', 'backend', 'design', 'tools']),
  icon: z.string().optional().default('code'),
  proficiency: z.number().min(0).max(100).optional().default(85),
  featured: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
});

// GET /api/skills (public)
router.get('/', (_req: Request, res: Response): void => {
  const skills = db.getSkills();
  res.json({ success: true, count: skills.length, data: skills });
});

const handleCreate = (req: Request, res: Response): void => {
  try {
    const parsed = skillSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Validation error' });
      return;
    }

    const created = db.createSkill(parsed.data);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('[Create Skill Error]', err);
    res.status(500).json({ success: false, error: 'Failed to create skill' });
  }
};

const handleUpdate = (req: Request, res: Response): void => {
  try {
    const updated = db.updateSkill(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Skill not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[Update Skill Error]', err);
    res.status(500).json({ success: false, error: 'Failed to update skill' });
  }
};

const handleDelete = (req: Request, res: Response): void => {
  try {
    const deleted = db.deleteSkill(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Skill not found' });
      return;
    }
    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (err) {
    console.error('[Delete Skill Error]', err);
    res.status(500).json({ success: false, error: 'Failed to delete skill' });
  }
};

router.post('/admin', requireAdmin, handleCreate);
router.post('/', requireAdmin, handleCreate);

router.patch('/admin/:id', requireAdmin, handleUpdate);
router.patch('/:id', requireAdmin, handleUpdate);

router.delete('/admin/:id', requireAdmin, handleDelete);
router.delete('/:id', requireAdmin, handleDelete);

export default router;
