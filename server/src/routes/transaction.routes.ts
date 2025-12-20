import { Router } from 'express';
import { getByShift } from '../controllers/transaction.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/shift/:shiftId', getByShift);

export default router;
