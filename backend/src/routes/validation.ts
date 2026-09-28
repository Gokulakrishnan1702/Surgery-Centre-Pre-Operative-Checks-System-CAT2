import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/validation/stakeholder
router.get('/stakeholder', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const data = store.getStakeholderValidationData();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/validation/deployment-readiness
router.get('/deployment-readiness', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const data = store.getDeploymentReadiness();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
