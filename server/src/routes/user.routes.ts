import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { assignUserToLocation, getUserLocation } from '../controllers/user-location.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/permission.middleware';
import { UserRole } from '../entities/User';
import { validateBody } from '../middleware/validation.middleware';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { ChangePasswordDto } from '../dtos/auth.dto';

const router = Router();
const controller = new UserController();

// All routes require authentication
// authentication is now handled globally in index.ts

// SUPER_ADMIN and ADMIN routes
router.get('/profile', controller.getProfile); // Moved up to valid collisions
router.get('/', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), controller.getAll);
router.post('/', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), validateBody(CreateUserDto), controller.create);
router.put('/:id', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), validateBody(UpdateUserDto, true), controller.update);
router.delete('/:id', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), controller.delete);

// Location assignment (SUPER_ADMIN and ADMIN only)
router.post('/:userId/assign-location', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), assignUserToLocation);
router.get('/:userId/location', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), getUserLocation);

// Any authenticated user can change their own password
router.post('/change-password', validateBody(ChangePasswordDto), controller.changePassword);

export default router;
