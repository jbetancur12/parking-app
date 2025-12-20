import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/permission.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const controller = new UserController();

// All routes require authentication
router.use(authenticateToken);

// SUPER_ADMIN only routes
router.get('/', requireRole([UserRole.SUPER_ADMIN]), controller.getAll);
router.post('/', requireRole([UserRole.SUPER_ADMIN]), controller.create);
router.put('/:id', requireRole([UserRole.SUPER_ADMIN]), controller.update);
router.delete('/:id', requireRole([UserRole.SUPER_ADMIN]), controller.delete);

// Any authenticated user can change their own password
router.post('/change-password', controller.changePassword);

export default router;
