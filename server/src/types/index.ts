export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Score {
  id: number;
  user_id: number;
  score: number;
  created_at: string;
}

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}
