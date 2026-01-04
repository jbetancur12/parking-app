import { Router } from 'express';
import { entryVehicle, exitVehicle, getActiveSessions, previewExit, publicStatus, getCompletedSessions } from '../controllers/parking.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { verifyTenantAccess } from '../middleware/permission.middleware';
import { saasContext } from '../middleware/saasContext';
import { validateBody } from '../middleware/validation.middleware';
import { CreateParkingEntryDto, CreateParkingExitDto, ExitPreviewDto } from '../dtos/parking.dto';

const router = Router();

// Public Routes
router.get('/public/status/:id', publicStatus);

// Protected Routes
router.use(authenticateToken);
router.use(saasContext);
router.use(verifyTenantAccess);
router.post('/entry', validateBody(CreateParkingEntryDto), entryVehicle);
router.get('/preview/:plate', previewExit);
router.post('/exit', validateBody(CreateParkingExitDto), exitVehicle);
router.get('/active', getActiveSessions);
router.get('/completed', getCompletedSessions);

export default router;
