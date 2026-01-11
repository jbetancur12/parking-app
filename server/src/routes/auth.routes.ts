import { Router } from 'express';
import { login, setupStatus, setupAdmin, registerTenant, impersonateTenant, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { loginLimiter } from '../middleware/rateLimit.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';

import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validateBody(RegisterDto), registerTenant);

router.post('/login', loginLimiter, validateBody(LoginDto), login);
router.post('/impersonate', authenticateToken, impersonateTenant);
// Checking routes... Auth routes usually public except this one.
// Let's see if I can import authenticateToken from ../middleware/auth.middleware
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/setup-status', setupStatus);
router.post('/setup-admin', validateBody(LoginDto), setupAdmin);

export default router;
