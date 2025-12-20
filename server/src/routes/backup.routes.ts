import { Router } from 'express';
import { exportData } from '../controllers/backup.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();

router.use(authenticateToken);

// Only Admins can download backups
router.get('/export', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), exportData);

export default router;
