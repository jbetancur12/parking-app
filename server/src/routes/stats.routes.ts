import { Router } from 'express';
import { getDashboardStats, getOccupancy } from '../controllers/stats.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', getDashboardStats);
router.get('/occupancy', getOccupancy);

export default router;
