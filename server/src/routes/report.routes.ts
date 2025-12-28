import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();
const controller = new ReportController();

router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN', 'LOCATION_MANAGER']));

router.get('/shift/:shiftId', controller.getShiftReport);
router.get('/daily', controller.getDailyStats);
router.get('/consolidated', controller.getConsolidatedReport); // New consolidated endpoint

export default router;
