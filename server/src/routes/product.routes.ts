import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new ProductController();

router.use(authenticateToken); // Requires Auth

// All these routes will pass through saasContext middleware (in index.ts)
// which filters query by tenant.

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
