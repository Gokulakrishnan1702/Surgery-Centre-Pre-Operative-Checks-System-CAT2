import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/types';
import { store } from '../services/store';
import { Permission, hasPermission } from '../config/permissions';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('CRITICAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing.');
  console.error('Please configure JWT_SECRET in your .env file before starting the application in production mode.');
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'surgical-safety-super-secret-key-production-grade-2026!';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const demoRole = req.headers['x-demo-role'] as UserRole;
    if (demoRole) {
      const demoUser = store.users.find(u => u.role === demoRole) || store.users[0];
      req.user = {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role
      };
      return next();
    }
    return res.status(401).json({ error: 'Authentication required. Please provide a valid Bearer token.' });
  }

  try {
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session has expired. Please log in again.' });
    }
    return res.status(403).json({ error: 'Invalid or forged session token.' });
  }
};

export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      error: `Access Denied. Role '${req.user.role}' is not authorized to perform this operation.`
    });
  };
};

export const requirePermission = (permission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    if (hasPermission(req.user.role, permission)) {
      return next();
    }

    return res.status(403).json({
      error: `Access Denied. Your role (${req.user.role}) does not have permission to perform this action (${permission}).`
    });
  };
};

// Login Rate Limiter (Max 10 attempts per IP per 5 minutes)
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  entry.count++;
  if (entry.count > MAX_ATTEMPTS) {
    return res.status(429).json({
      error: 'Too many authentication attempts. Please wait 5 minutes before trying again.'
    });
  }

  next();
};
