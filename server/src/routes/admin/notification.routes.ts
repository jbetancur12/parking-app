import { Router } from 'express';
import { createNotification, deleteNotification, getActiveNotifications, getAllNotificationsAdmin } from '../../controllers/admin/notification.controller';
import { authenticateToken, authorizeRole } from '../../middleware/auth.middleware';

const router = Router();

// Public/Authenticated User Read Access
router.get('/active', authenticateToken, getActiveNotifications);

// Admin Management Access
router.post('/', authenticateToken, authorizeRole(['SUPER_ADMIN']), createNotification);
router.get('/all', authenticateToken, authorizeRole(['SUPER_ADMIN']), getAllNotificationsAdmin);
router.delete('/:id', authenticateToken, authorizeRole(['SUPER_ADMIN']), deleteNotification);

export default router;
