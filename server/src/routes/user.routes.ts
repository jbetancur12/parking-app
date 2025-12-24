import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { assignUserToLocation, getUserLocation } from '../controllers/user-location.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/permission.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const controller = new UserController();

// All routes require authentication
// authentication is now handled globally in index.ts

// SUPER_ADMIN and ADMIN routes
router.get('/', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), controller.getAll);
router.post('/', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), controller.create);
router.put('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), controller.update);
router.delete('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), controller.delete);

// Location assignment (SUPER_ADMIN and ADMIN only)
router.post('/:userId/assign-location', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), assignUserToLocation);
router.get('/:userId/location', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), getUserLocation);

// Any authenticated user can change their own password
router.post('/change-password', controller.changePassword);

export default router;
