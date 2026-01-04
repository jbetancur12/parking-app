import { Router } from 'express';
import { getPeakHours, getWeeklyOccupancy, getDashboardStats, getOccupancy, getSuperAdminStats } from '../controllers/stats.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();

router.use(authenticateToken); // All stats routes require auth

// Only Admin/SuperAdmin can view stats
router.get('/peak-hours', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LOCATION_MANAGER]), getPeakHours);
router.get('/occupancy-weekly', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LOCATION_MANAGER]), getWeeklyOccupancy);
router.get('/dashboard', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LOCATION_MANAGER]), getDashboardStats);
router.get('/super-admin', requireRole([UserRole.SUPER_ADMIN]), getSuperAdminStats);

// Allow operators to see occupancy
router.get('/occupancy', getOccupancy);

export default router;
