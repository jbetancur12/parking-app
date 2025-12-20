import { Router } from 'express';
import { entryVehicle, exitVehicle, getActiveSessions, previewExit } from '../controllers/parking.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/entry', entryVehicle);
router.get('/preview/:plate', previewExit);
router.post('/exit', exitVehicle);
router.get('/active', getActiveSessions);

export default router;
