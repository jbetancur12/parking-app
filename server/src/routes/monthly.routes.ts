import { Router } from 'express';
import { MonthlyClientController } from '../controllers/monthly.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new MonthlyClientController();

router.use(authenticateToken); // Protect all routes

router.get('/', controller.getAll);
router.post('/', controller.create);
router.post('/:id/renew', controller.renew);
router.get('/:id/history', controller.getHistory);
router.patch('/:id/status', controller.toggleStatus);
router.post('/:id/anonymize', controller.anonymize);

export default router;
