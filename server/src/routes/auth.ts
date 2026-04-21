import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import db from '../db/index';
import { User } from '../types/index';

const router = Router();

const signupSchema = z.object({
  username: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(6),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/signup', async (req, res) => {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { username, email, password } = result.data;

  try {
    const existing = db
      .prepare('SELECT id FROM users WHERE email = ? OR username = ?')
      .get(email, username) as Pick<User, 'id'> | undefined;

    if (existing) {
      res.status(409).json({ error: 'Email or username already taken' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const info = db
      .prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
      .run(username, email, password_hash);

    req.session.userId = info.lastInsertRowid as number;
    res.status(201).json({ id: info.lastInsertRowid, username, email });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/signin', async (req, res) => {
  const result = signinSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { email, password } = result.data;

  try {
    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as User | undefined;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    req.session.userId = user.id;
    res.json({ id: user.id, username: user.username, email: user.email });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/signout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Signed out' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const user = db
    .prepare('SELECT id, username, email FROM users WHERE id = ?')
    .get(req.session.userId) as Omit<User, 'password_hash' | 'created_at'> | undefined;

  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  res.json(user);
});

export default router;
