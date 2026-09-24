import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const notifs = store.getNotifications(req.user?.role);
  const unreadCount = notifs.filter(n => !n.read).length;
  return res.json({ notifications: notifs, unreadCount });
});

// POST /api/notifications/:id/read
router.post('/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
  const notif = store.markNotificationRead(req.params.id as string);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  return res.json(notif);
});

// POST /api/notifications/read-all
router.post('/read-all', authenticateToken, (req: AuthRequest, res: Response) => {
  store.markAllNotificationsRead(req.user?.role);
  return res.json({ message: 'All notifications marked as read' });
});

export default router;
