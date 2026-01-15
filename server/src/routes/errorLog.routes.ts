import express from 'express';
import { createErrorLog, getErrorLogs, resolveErrorLog } from '../controllers/errorLog.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/permission.middleware';
import { UserRole } from '../entities/User';

const router = express.Router();

// Public endpoint - no authentication required
// This allows errors to be logged even if user is not logged in
router.post('/', createErrorLog);

// Protected endpoints - Super Admin only
router.get('/', authenticateToken, requireRole([UserRole.SUPER_ADMIN]), getErrorLogs);
router.patch('/:id/resolve', authenticateToken, requireRole([UserRole.SUPER_ADMIN]), resolveErrorLog);

export default router;
