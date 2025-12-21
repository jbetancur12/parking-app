import { Router } from 'express';
import { getPeakHours, getWeeklyOccupancy, getDashboardStats } from '../controllers/stats.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();

router.use(authenticateToken); // All stats routes require auth

// Only Admin/SuperAdmin can view stats
router.get('/peak-hours', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), getPeakHours);
router.get('/occupancy-weekly', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), getWeeklyOccupancy);
router.get('/dashboard', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), getDashboardStats);

export default router;
