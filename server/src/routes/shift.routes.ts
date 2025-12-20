import { Router } from 'express';
import { openShift, closeShift, getActiveShift, getAllClosed } from '../controllers/shift.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken); // Protect all shift routes

router.post('/open', openShift);
router.post('/close', closeShift);
router.get('/current', getActiveShift);
router.get('/closed', getAllClosed);

export default router;
