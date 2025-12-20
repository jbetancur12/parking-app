import { Router } from 'express';
import { SystemSettingController } from '../controllers/setting.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new SystemSettingController();

router.use(authenticateToken);

router.get('/', controller.getAll);
router.post('/', controller.update);

export default router;
