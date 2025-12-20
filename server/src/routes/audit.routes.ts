import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();
const controller = new AuditController();

router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

router.get('/', controller.getAll);

export default router;
