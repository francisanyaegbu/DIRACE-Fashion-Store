import { type Request, type Response, type NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.js';
import { type DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users.js';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    // Sync user to PostgreSQL
    const email = decodedToken.email;
    const name = decodedToken.name;
    if (email) {
      req.dbUser = await getOrCreateUser(decodedToken.uid, email, name);
    }

    return next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
