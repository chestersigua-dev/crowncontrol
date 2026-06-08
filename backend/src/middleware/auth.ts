import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pageant_jwt_super_secret_key_12345';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: 'SUPERADMIN' | 'ADMIN' | 'JUDGE' | 'PUBLIC';
    name: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      req.user = decoded as AuthRequest['user'];
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization token required' });
  }
};

export const requireRole = (roles: Array<'SUPERADMIN' | 'ADMIN' | 'JUDGE' | 'PUBLIC'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(430).json({ error: `Forbidden: requires one of roles [${roles.join(', ')}]` });
    }

    next();
  };
};
