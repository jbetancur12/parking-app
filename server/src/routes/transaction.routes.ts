import { Router } from 'express';
import { getByShift, deleteTransaction } from '../controllers/transaction.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Restrict viewing full transaction history/shift data to admins
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

router.get('/shift/:shiftId', getByShift);
router.delete('/:id', deleteTransaction);

export default router;
