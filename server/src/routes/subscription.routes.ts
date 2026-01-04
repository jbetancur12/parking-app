import { Router } from 'express';
import {
    getCurrentSubscription,
    getPlans,
    changePlan,
    cancelSubscription
} from '../controllers/subscription.controller';

const router = Router();

// All routes require authentication (handled globally)

router.get('/current', getCurrentSubscription);
router.get('/plans', getPlans);
router.post('/change-plan', changePlan);
router.post('/cancel', cancelSubscription);

export default router;
