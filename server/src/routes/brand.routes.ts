import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const controller = new BrandController();

router.use(authenticateToken);

router.get('/', requireRole([UserRole.SUPER_ADMIN]), controller.getAll);
router.post('/', requireRole([UserRole.SUPER_ADMIN]), controller.create);
router.delete('/:id', requireRole([UserRole.SUPER_ADMIN]), controller.delete);

export default router;
