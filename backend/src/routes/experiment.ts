import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/experiment/metrics
router.get('/metrics', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const data = store.getExperimentData();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/experiment/errors
router.get('/errors', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const errors = store.getErrorAnalysisData();
    return res.json(errors);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
