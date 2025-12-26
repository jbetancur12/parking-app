import { Router } from 'express';
import { login, setupStatus, setupAdmin, registerTenant } from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerTenant);

router.post('/login', login);
router.get('/setup-status', setupStatus);
router.post('/setup-admin', setupAdmin);

export default router;
