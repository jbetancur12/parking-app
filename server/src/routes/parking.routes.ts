import { Router } from 'express';
import { entryVehicle, exitVehicle, getActiveSessions, previewExit, publicStatus, getCompletedSessions } from '../controllers/parking.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { verifyTenantAccess } from '../middleware/permission.middleware';
import { saasContext } from '../middleware/saasContext';

const router = Router();

// Public route (must be before authenticateToken for global use, OR handled selectively)
// Since we used router.use(authenticateToken) globally below, we need to arrange carefully.
// Express routers execute middleware in order.

// Public Routes
router.get('/public/status/:id', publicStatus);

// Protected Routes
router.use(authenticateToken);
router.use(saasContext);
router.use(verifyTenantAccess);
router.post('/entry', entryVehicle);
router.get('/preview/:plate', previewExit);
router.post('/exit', exitVehicle);
router.get('/active', getActiveSessions);
router.get('/completed', getCompletedSessions);

export default router;
