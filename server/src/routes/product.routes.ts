import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const controller = new ProductController();

router.use(authenticateToken); // Requires Auth

// All these routes will pass through saasContext middleware (in index.ts)
// which filters query by tenant.

router.get('/', controller.getAll);
router.post('/', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LOCATION_MANAGER]), controller.create);
router.put('/:id', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LOCATION_MANAGER]), controller.update);
router.delete('/:id', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LOCATION_MANAGER]), controller.delete);

export default router;
