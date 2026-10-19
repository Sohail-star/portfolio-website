import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { requireAdmin } from '../auth';

const router = Router();

const projectSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(5, 'Short description is required'),
  longDescription: z.string().optional(),
  imageUrl: z.string().min(1, 'Image URL is required'),
  technologies: z.array(z.string()).min(1, 'At least one technology tag is required'),
  category: z.enum(['web', 'design', 'app', 'all']),
  liveDemoUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

// GET /api/projects (public: published projects only)
router.get('/', (_req: Request, res: Response): void => {
  const projects = db.getProjects(false);
  res.json({ success: true, count: projects.length, data: projects });
});

// GET /api/projects/:slug (public: single project)
router.get('/:slug', (req: Request, res: Response): void => {
  const project = db.getProjectBySlug(req.params.slug);
  if (!project || !project.published) {
    res.status(404).json({ success: false, error: 'Project not found' });
    return;
  }
  res.json({ success: true, data: project });
});

// GET /api/admin/projects (protected: all projects including drafts)
router.get('/admin/all', requireAdmin, (_req: Request, res: Response): void => {
  const projects = db.getProjects(true);
  res.json({ success: true, count: projects.length, data: projects });
});

// POST /api/admin/projects (protected: create project)
router.post('/admin', requireAdmin, (req: Request, res: Response): void => {
  try {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Validation error' });
      return;
    }

    const created = db.createProject(parsed.data);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('[Create Project Error]', err);
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
});

// PATCH /api/admin/projects/:id (protected: update project)
router.patch('/admin/:id', requireAdmin, (req: Request, res: Response): void => {
  try {
    const updated = db.updateProject(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[Update Project Error]', err);
    res.status(500).json({ success: false, error: 'Failed to update project' });
  }
});

// DELETE /api/admin/projects/:id (protected: delete project)
router.delete('/admin/:id', requireAdmin, (req: Request, res: Response): void => {
  try {
    const deleted = db.deleteProject(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    console.error('[Delete Project Error]', err);
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
});

export default router;
