import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import scoresRouter from './routes/scores';

// must import types so session augmentation is registered
import './types/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'treasure-game-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

app.use('/api/auth', authRouter);
app.use('/api/scores', scoresRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
