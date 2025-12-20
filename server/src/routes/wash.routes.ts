import { Router } from 'express';
import { WashController } from '../controllers/wash.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new WashController();

router.use(authenticateToken);

router.get('/types', controller.getServiceTypes);
router.get('/entries/shift/:shiftId', controller.getAllByShift);
router.post('/entries', controller.createEntry);
router.post('/seed', controller.seedServices);

export default router;
