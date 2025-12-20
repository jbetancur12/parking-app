import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new ExpenseController();

router.use(authenticateToken);

router.post('/', controller.create);
router.get('/shift/:shiftId', controller.getAllByShift);

export default router;
