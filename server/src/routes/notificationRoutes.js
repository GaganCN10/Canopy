import { Router } from 'express';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const result = await getNotifications(req.user._id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      unreadOnly: unreadOnly === 'true',
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const notification = await markNotificationAsRead(req.user._id, req.params.id);
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', authMiddleware, async (req, res, next) => {
  try {
    const result = await markAllNotificationsAsRead(req.user._id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
