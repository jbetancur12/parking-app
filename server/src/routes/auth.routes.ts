import { Router } from 'express';
import { login, setupStatus, setupAdmin, registerTenant } from '../controllers/auth.controller';
import { loginLimiter } from '../middleware/rateLimit.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';

const router = Router();

router.post('/register', validateBody(RegisterDto), registerTenant);

router.post('/login', loginLimiter, validateBody(LoginDto), login);
router.get('/setup-status', setupStatus);
router.post('/setup-admin', validateBody(LoginDto), setupAdmin);

export default router;
