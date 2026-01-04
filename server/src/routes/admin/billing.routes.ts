import { Router } from 'express';
import {
    getAllSubscriptions
} from '../../controllers/subscription.controller';
import {
    getAllInvoices,
    createInvoice,
    recordPayment,
    getAllPayments,
    getPaymentStats
} from '../../controllers/billing.controller';
import { requireRole } from '../../middleware/permission.middleware';
import { UserRole } from '../../entities/User';

const router = Router();

// All routes require SUPER_ADMIN role

// Subscriptions
router.get('/subscriptions', requireRole([UserRole.SUPER_ADMIN]), getAllSubscriptions);

// Invoices
router.get('/invoices', requireRole([UserRole.SUPER_ADMIN]), getAllInvoices);
router.post('/invoices', requireRole([UserRole.SUPER_ADMIN]), createInvoice);

// Payments
router.get('/payments', requireRole([UserRole.SUPER_ADMIN]), getAllPayments);
router.post('/payments', requireRole([UserRole.SUPER_ADMIN]), recordPayment);
router.get('/payments/stats', requireRole([UserRole.SUPER_ADMIN]), getPaymentStats);

export default router;
