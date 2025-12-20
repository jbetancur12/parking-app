import { Router } from 'express';
import { login, setupStatus, setupAdmin } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.get('/setup-status', setupStatus);
router.post('/setup-admin', setupAdmin);

export default router;
