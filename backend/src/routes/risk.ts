import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

// GET /api/risk/patient/:patientId
router.get('/patient/:patientId', authenticateToken, requirePermission('VIEW_PATIENTS'), (req: AuthRequest, res: Response) => {
  const patientId = req.params.patientId as string;
  try {
    const riskResult = store.assessPatientRisk(patientId);
    return res.json(riskResult);
  } catch (err: any) {
    return res.status(404).json({ error: err.message || 'Failed to calculate clinical risk.' });
  }
});

export default router;
