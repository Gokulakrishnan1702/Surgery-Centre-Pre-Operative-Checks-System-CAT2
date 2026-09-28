import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

// GET /api/safety-lab
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const tests = store.getSafetyLabTests();
    return res.json(tests);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/safety-lab/run/:id
router.post('/run/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const user = req.user || { id: 'usr-1', name: 'Dr. Marcus Vance', role: 'SURGEON' as const };
    const result = store.runSafetyLabTest(id, user);
    return res.json({
      message: `Safety test ${id} executed successfully.`,
      result
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
