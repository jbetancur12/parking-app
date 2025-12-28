import { Router } from 'express';
import { SystemSettingController } from '../controllers/setting.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const controller = new SystemSettingController();

router.use(authenticateToken);

router.get('/', controller.getAll);
router.post('/', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LOCATION_MANAGER]), controller.update);

export default router;
