import { Router } from 'express';
import { TariffController } from '../controllers/tariff.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new TariffController();

router.use(authenticateToken);

router.get('/', controller.getAll);
router.post('/', controller.update);
router.post('/seed', controller.seedDefaults);

export default router;
