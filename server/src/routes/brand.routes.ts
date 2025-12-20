import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new BrandController();

router.use(authenticateToken);

router.get('/', controller.getAll);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

export default router;
