import { Router } from 'express';
import { AgreementController } from '../controllers/agreement.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();
const controller = new AgreementController();

router.use(authenticateToken);

// Public (authenticated users can see active agreements for checkout)
router.get('/active', controller.getActive);

// Admin only routes
router.get('/', requireRole(['ADMIN', 'SUPER_ADMIN']), controller.getAll);
router.post('/', requireRole(['ADMIN', 'SUPER_ADMIN']), controller.create);
router.patch('/:id/status', requireRole(['ADMIN', 'SUPER_ADMIN']), controller.toggleStatus);

export default router;
