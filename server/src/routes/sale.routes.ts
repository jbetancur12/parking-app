import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new SaleController();

router.use(authenticateToken);

router.post('/', controller.create);
router.get('/shift/:shiftId', controller.getAllByShift);

export default router;
