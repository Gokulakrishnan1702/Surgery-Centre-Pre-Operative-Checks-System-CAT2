import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

// GET /api/users
router.get('/', authenticateToken, requirePermission('MANAGE_USERS'), (req: AuthRequest, res: Response) => {
  return res.json({
    users: store.users.map(u => ({
      ...u,
      permissions: getPermissionsForRole(u.role)
    }))
  });
});

// PUT /api/users/:id/role
router.put('/:id/role', authenticateToken, requirePermission('MANAGE_ROLES'), (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  const user = store.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const oldRole = user.role;
  user.role = role;

  store.addAuditLog({
    event_type: 'ROLE_CHANGED',
    user_id: req.user!.id,
    user_name: req.user!.name,
    user_role: req.user!.role,
    decision: 'ROLE_MODIFIED',
    details: `User ${user.name} role changed from ${oldRole} to ${role} by Admin ${req.user!.name}.`
  });

  return res.json({ message: 'User role updated', user });
});

function getPermissionsForRole(role: string) {
  switch (role) {
    case 'ADMIN':
      return ['Full system access', 'User management', 'Global overrides', 'Audit export', 'Settings configuration'];
    case 'SURGEON':
      return ['View assigned patients', 'Confirm critical checklist steps', 'Request/authorize overrides', 'Final surgical sign-off'];
    case 'NURSE':
      return ['Update standard checklist items', 'Upload synthetic evidence', 'Verify nursing-assigned steps'];
    case 'ANESTHETIST':
      return ['Verify ASA classification & airway', 'Upload anesthesia documentation', 'Sign off anesthesia clearance'];
    case 'RADIOLOGIST':
      return ['Review PACS imaging evidence', 'Verify radiological anatomical landmarks'];
    case 'PATHOLOGIST':
      return ['Review lab panels & coagulation results', 'Verify pathology clearance'];
    case 'CARDIOLOGIST':
      return ['Verify cardiac clearance & echo documentation', 'Sign off cardiac clearance checklist'];
    case 'AUDITOR':
      return ['Read-only compliance inspection', 'Immutable audit logs verification', 'Safety analytics inspection'];
    default:
      return ['Standard read-only access'];
  }
}

export default router;
