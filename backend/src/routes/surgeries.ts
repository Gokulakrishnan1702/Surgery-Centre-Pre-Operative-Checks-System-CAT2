import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';
import { SurgeryStatus } from '../models/types';

const router = Router();

// GET /api/surgeries
router.get('/', authenticateToken, requirePermission('VIEW_PATIENTS'), (req: AuthRequest, res: Response) => {
  const { status, risk, search } = req.query;
  const surgeries = store.getSurgeries(req.user, {
    status: status as string,
    risk: risk as string,
    search: search as string
  });
  return res.json({ surgeries, total: surgeries.length });
});

// GET /api/surgeries/:id
router.get('/:id', authenticateToken, requirePermission('VIEW_PATIENTS'), (req: AuthRequest, res: Response) => {
  const surgery = store.getSurgeryById(req.params.id as string);
  if (!surgery) {
    return res.status(404).json({ error: 'Surgery case not found.' });
  }
  return res.json(surgery);
});

// POST /api/surgeries
router.post('/', authenticateToken, requirePermission('EDIT_PATIENTS'), (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });

  const { procedure, patient_id, department, operating_room, scheduled_datetime, risk_level, notes } = req.body;
  if (!procedure || !patient_id) {
    return res.status(400).json({ error: 'Procedure name and Patient ID are required.' });
  }

  const patient = store.patients.find(p => p.id === patient_id || p.patient_id === patient_id);
  const newSurgery = store.createSurgery(
    {
      patient_id: patient ? patient.id : patient_id,
      patient_name: patient ? patient.name : 'Unknown Patient',
      procedure,
      department,
      operating_room,
      scheduled_datetime,
      risk_level,
      notes
    },
    req.user
  );

  return res.status(201).json(newSurgery);
});

const handleStatusUpdate = (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });

  const { status, notes } = req.body;
  const validStatuses: SurgeryStatus[] = [
    'PLANNED', 'PREPARING', 'READY', 'EXCEPTION', 'APPROVAL_PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Valid surgery status is required.' });
  }

  try {
    const updated = store.updateSurgeryStatus(req.params.id as string, status, req.user);
    return res.json({ message: 'Surgery status updated', surgery: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update surgery status.' });
  }
};

router.patch('/:id/status', authenticateToken, requirePermission('EDIT_PATIENTS'), handleStatusUpdate);
router.put('/:id/status', authenticateToken, requirePermission('EDIT_PATIENTS'), handleStatusUpdate);

export default router;
