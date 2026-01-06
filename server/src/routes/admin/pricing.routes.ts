import { Router } from 'express';
import {
    getAllPlans,
    getPlanByCode,
    createPlan,
    updatePlan,
    togglePlanStatus
} from '../../controllers/admin/pricing.controller';
import { requireRole } from '../../middleware/permission.middleware';
import { UserRole } from '../../entities/User';

const router = Router();

// All routes require SUPER_ADMIN role

router.get('/plans', requireRole([UserRole.SUPER_ADMIN]), getAllPlans);
router.post('/plans', requireRole([UserRole.SUPER_ADMIN]), createPlan);
router.get('/plans/:code', requireRole([UserRole.SUPER_ADMIN]), getPlanByCode);
router.put('/plans/:code', requireRole([UserRole.SUPER_ADMIN]), updatePlan);
router.patch('/plans/:code/status', requireRole([UserRole.SUPER_ADMIN]), togglePlanStatus);

export default router;
