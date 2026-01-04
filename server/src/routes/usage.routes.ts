import { Router } from 'express';
import { getCurrentUsage } from '../controllers/usage.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { saasContext } from '../middleware/saasContext';
import { verifyTenantAccess } from '../middleware/permission.middleware';

const router = Router();

// All routes require authentication and tenant context
router.use(authenticateToken);
router.use(saasContext);
router.use(verifyTenantAccess);

router.get('/current', getCurrentUsage);

export default router;
