import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

// GET /api/analytics/overview
router.get('/overview', authenticateToken, requirePermission('VIEW_DASHBOARD'), (req: AuthRequest, res: Response) => {
  const kpis = store.getDashboardKpis(req.user);
  return res.json(kpis);
});

// GET /api/analytics/experiment
router.get('/experiment', authenticateToken, requirePermission('VIEW_ANALYTICS'), (req: AuthRequest, res: Response) => {
  const expData = store.getExperimentData();
  return res.json(expData);
});

export default router;
