import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new ReportController();

router.use(authenticateToken);

router.get('/shift/:shiftId', controller.getShiftReport);
router.get('/daily', controller.getDailyStats);

export default router;
