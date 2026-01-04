import { Router } from 'express';
import {
    getInvoices,
    getInvoiceById,
    getPayments
} from '../controllers/billing.controller';

const router = Router();

// All routes require authentication (handled globally)

router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.get('/payments', getPayments);

export default router;
