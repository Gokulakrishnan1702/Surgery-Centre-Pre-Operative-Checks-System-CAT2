import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

// GET /api/exceptions
router.get('/', authenticateToken, requirePermission('VIEW_EXCEPTIONS'), (req: AuthRequest, res: Response) => {
  const { status, severity, assigned_role } = req.query;
  let list = [...store.exceptions];

  if (status && status !== 'ALL') {
    list = list.filter(e => e.status === status);
  }
  if (severity && severity !== 'ALL') {
    list = list.filter(e => e.severity === severity);
  }
  if (assigned_role && assigned_role !== 'ALL') {
    list = list.filter(e => e.assigned_role === assigned_role);
  }

  return res.json(list);
});

// POST /api/exceptions
router.post('/', authenticateToken, requirePermission('CREATE_EXCEPTION'), (req: AuthRequest, res: Response) => {
  const { patient_id, checklist_item_id, category, severity, reason, assigned_role } = req.body;

  if (!patient_id || !checklist_item_id || !reason) {
    return res.status(400).json({ error: 'Patient ID, checklist item ID, and reason are required.' });
  }

  try {
    const exc = store.createException({
      patient_id,
      checklist_item_id,
      category: category || 'Missing Evidence',
      severity: severity || 'HIGH',
      reason,
      user: req.user!
    });
    return res.status(201).json(exc);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/exceptions/:id/resolve
router.put('/:id/resolve', authenticateToken, requirePermission('RESOLVE_EXCEPTION'), (req: AuthRequest, res: Response) => {
  const exc = store.exceptions.find(e => e.id === req.params.id);
  if (!exc) {
    return res.status(404).json({ error: 'Exception not found' });
  }

  exc.status = 'RESOLVED';
  exc.resolved_by = req.user!.name;
  exc.resolved_at = new Date().toISOString();
  exc.resolution_notes = req.body.notes || 'Resolved through manual clinician review.';

  store.addAuditLog({
    event_type: 'EXCEPTION_RESOLVED',
    patient_id: exc.patient_id,
    patient_name: exc.patient_name,
    checklist_step: exc.checklist_step_name,
    user_id: req.user!.id,
    user_name: req.user!.name,
    user_role: req.user!.role,
    decision: 'RESOLVED',
    details: `Exception ${exc.id} marked as RESOLVED by ${req.user!.name}: ${exc.resolution_notes}`
  });

  return res.json(exc);
});

export default router;
