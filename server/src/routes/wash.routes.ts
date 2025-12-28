import { Router } from 'express';
import { WashController } from '../controllers/wash.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const controller = new WashController();

router.use(authenticateToken);

router.get('/types', controller.getServiceTypes);
router.get('/entries/shift/:shiftId', controller.getAllByShift);
router.post('/entries', controller.createEntry);
router.post('/seed', controller.seedServices);

// Service Types CRUD
router.post('/types', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LOCATION_MANAGER]), controller.createType);
router.put('/types/:id', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LOCATION_MANAGER]), controller.updateType);
router.delete('/types/:id', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LOCATION_MANAGER]), controller.deleteType);

export default router;
