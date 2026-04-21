import { Router } from 'express';
import { z } from 'zod';
import db from '../db/index';
import { requireAuth } from '../middleware/auth';
import { Score } from '../types/index';

const router = Router();

const scoreSchema = z.object({
  score: z.number().int(),
});

router.post('/', requireAuth, (req, res) => {
  const result = scoreSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { score } = result.data;
  const userId = req.session.userId!;

  const info = db
    .prepare('INSERT INTO scores (user_id, score) VALUES (?, ?)')
    .run(userId, score);

  res.status(201).json({ id: info.lastInsertRowid, score, created_at: new Date().toISOString() });
});

router.get('/', requireAuth, (req, res) => {
  const userId = req.session.userId!;

  const scores = db
    .prepare('SELECT id, score, created_at FROM scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 10')
    .all(userId) as Pick<Score, 'id' | 'score' | 'created_at'>[];

  res.json(scores);
});

export default router;
