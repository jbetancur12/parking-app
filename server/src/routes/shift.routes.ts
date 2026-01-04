import { Router } from 'express';
import { openShift, closeShift, getActiveShift, getAllClosed } from '../controllers/shift.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { OpenShiftDto, CloseShiftDto } from '../dtos/shift.dto';

const router = Router();

// authentication is now handled globally in index.ts

router.post('/open', validateBody(OpenShiftDto), openShift);
router.post('/close', validateBody(CloseShiftDto), closeShift);
router.get('/current', getActiveShift);
router.get('/closed', getAllClosed);

export default router;
