import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new SaleController();

router.use(authenticateToken);

router.post('/', controller.create);

export default router;
