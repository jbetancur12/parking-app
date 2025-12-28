import { Router } from 'express';
import { TariffController } from '../controllers/tariff.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const controller = new TariffController();

router.use(authenticateToken);

router.get('/', controller.getAll);
router.post('/', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LOCATION_MANAGER]), controller.update);
router.post('/seed', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LOCATION_MANAGER]), controller.seedDefaults);

export default router;
