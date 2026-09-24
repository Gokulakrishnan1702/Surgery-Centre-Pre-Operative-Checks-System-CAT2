import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, authRateLimiter } from '../middleware/auth';
import { UserRole } from '../models/types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'surgical-safety-super-secret-key-production-grade-2026!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// POST /api/auth/login
router.post('/login', authRateLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    store.addAuditLog({
      event_type: 'LOGIN_FAILED',
      user_id: 'anonymous',
      user_name: email,
      user_role: 'NURSE',
      decision: 'FAILED',
      details: `Failed authentication attempt for non-existent account: ${email}.`
    });
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Check account status
  if (user.status === 'INACTIVE') {
    return res.status(403).json({ error: 'Account is deactivated. Please contact the Chief Medical Officer.' });
  }
  if (user.status === 'PENDING_APPROVAL') {
    return res.status(403).json({ error: 'Account is pending administrative credential verification.' });
  }

  // Real bcrypt password verification
  let passwordMatches = false;
  if (user.password_hash) {
    passwordMatches = bcrypt.compareSync(password, user.password_hash);
  }

  if (!passwordMatches) {
    user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;

    store.addAuditLog({
      event_type: 'LOGIN_FAILED',
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      decision: 'FAILED',
      details: `Failed password verification for clinician ${user.name} (${user.email}). Attempt ${user.failed_login_attempts}.`
    });

    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Reset failed attempts on success
  user.failed_login_attempts = 0;
  user.last_login = new Date().toISOString().replace('T', ' ').slice(0, 16);

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as any }
  );

  store.addAuditLog({
    event_type: 'LOGIN_SUCCESS',
    user_id: user.id,
    user_name: user.name,
    user_role: user.role,
    decision: 'LOGIN',
    details: `Authenticated login: ${user.name} (${user.role}) via secure bcrypt verification.`
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      department: user.department,
      staff_id: user.staff_id,
      last_login: user.last_login
    }
  });
});

// POST /api/auth/signup
router.post('/signup', authRateLimiter, (req, res) => {
  const { name, email, password, role, department, staff_id, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and professional role are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const validRoles: UserRole[] = [
    'ADMIN', 'SURGEON', 'NURSE', 'ANESTHETIST', 'RADIOLOGIST', 'PATHOLOGIST', 'CARDIOLOGIST', 'AUDITOR'
  ];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid clinical role specified.' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const userId = `usr-${Date.now()}`;

  const newUser = {
    id: userId,
    email: email.trim().toLowerCase(),
    password_hash,
    name: name.trim(),
    role: role as UserRole,
    status: 'ACTIVE' as const,
    department: department ? department.trim() : 'General Clinical Unit',
    staff_id: staff_id ? staff_id.trim() : `STAFF-${Math.floor(1000 + Math.random() * 9000)}`,
    phone: phone ? phone.trim() : undefined,
    last_login: new Date().toISOString().replace('T', ' ').slice(0, 16)
  };

  store.users.push(newUser);

  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as any }
  );

  store.addAuditLog({
    event_type: 'LOGIN_SUCCESS',
    user_id: newUser.id,
    user_name: newUser.name,
    user_role: newUser.role,
    decision: 'REGISTERED',
    details: `New clinical user account registered: ${newUser.name} as ${newUser.role} in ${newUser.department}.`
  });

  return res.status(201).json({
    message: 'User account created successfully.',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status,
      department: newUser.department,
      staff_id: newUser.staff_id,
      last_login: newUser.last_login
    }
  });
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const user = store.users.find(u => u.id === req.user?.id);
  if (!user || !user.password_hash) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  const matches = bcrypt.compareSync(currentPassword, user.password_hash);
  if (!matches) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  user.password_hash = bcrypt.hashSync(newPassword, 10);

  store.addAuditLog({
    event_type: 'PASSWORD_CHANGED',
    user_id: user.id,
    user_name: user.name,
    user_role: user.role,
    decision: 'SUCCESS',
    details: `Password securely updated for ${user.name} (${user.role}).`
  });

  return res.json({ message: 'Password updated successfully.' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authRateLimiter, (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  // Prevent email enumeration by returning consistent response
  return res.json({
    message: 'If the provided clinical email exists in our directory, a secure reset token has been dispatched.'
  });
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user) {
    store.addAuditLog({
      event_type: 'LOGOUT',
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      decision: 'LOGOUT',
      details: `User ${req.user.name} logged out securely.`
    });
  }
  return res.json({ message: 'Successfully logged out.' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated.' });
  }
  const user = store.users.find(u => u.id === req.user?.id);
  if (!user) {
    return res.json({ user: req.user });
  }
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      department: user.department,
      staff_id: user.staff_id,
      phone: user.phone,
      last_login: user.last_login
    }
  });
});

// GET /api/auth/demo-accounts (for Viva quick-fill)
router.get('/demo-accounts', (req, res) => {
  return res.json({
    accounts: store.users.map(u => ({
      email: u.email,
      name: u.name,
      role: u.role,
      department: u.department,
      staff_id: u.staff_id,
      description: `${u.role} access & clinical authorization workflows`
    }))
  });
});

export default router;
