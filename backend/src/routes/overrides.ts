import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

const getParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || '';
  return param || '';
};

// GET /api/overrides
router.get('/', authenticateToken, requirePermission('VIEW_EXCEPTIONS'), (req: AuthRequest, res: Response) => {
  return res.json(store.overrides);
});

// POST /api/overrides (Request Override)
router.post('/', authenticateToken, requirePermission('REQUEST_OVERRIDE'), (req: AuthRequest, res: Response) => {
  const { patient_id, checklist_item_id, reason, business_reason, impact } = req.body;

  try {
    const ovr = store.requestOverride({
      patient_id,
      checklist_item_id,
      reason,
      business_reason,
      impact: impact || 'HIGH',
      user: req.user!
    });
    return res.status(201).json(ovr);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/overrides/:id/approve
router.post('/:id/approve', authenticateToken, requirePermission('APPROVE_OVERRIDE'), (req: AuthRequest, res: Response) => {
  const { notes } = req.body;
  const id = getParam(req.params.id);
  try {
    const ovr = store.decideOverride(id, 'APPROVED', req.user!, notes);
    return res.json({ message: 'Override request approved and audit logged.', override: ovr });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/overrides/:id/reject
router.post('/:id/reject', authenticateToken, requirePermission('REJECT_OVERRIDE'), (req: AuthRequest, res: Response) => {
  const { notes } = req.body;
  const id = getParam(req.params.id);
  try {
    const ovr = store.decideOverride(id, 'REJECTED', req.user!, notes);
    return res.json({ message: 'Override request rejected.', override: ovr });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
