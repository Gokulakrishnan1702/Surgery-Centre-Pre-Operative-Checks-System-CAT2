import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

// GET /api/fairness
router.get('/', authenticateToken, requirePermission('VIEW_BIAS'), (req: AuthRequest, res: Response) => {
  const threshold = req.query.threshold ? parseFloat(req.query.threshold as string) : store.fairnessThreshold;
  const evaluation = store.evaluateFairness(threshold);
  return res.json(evaluation);
});

// POST /api/fairness/run
router.post('/run', authenticateToken, requirePermission('VIEW_BIAS'), (req: AuthRequest, res: Response) => {
  const threshold = req.body.threshold ? parseFloat(req.body.threshold) : 5.0;
  const evaluation = store.evaluateFairness(threshold);
  return res.json({
    message: 'Bias and fairness testing evaluation completed across synthetic cohorts.',
    evaluation
  });
});

export default router;
