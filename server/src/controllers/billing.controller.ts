import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { InvoiceService } from '../services/invoice.service';
import { PaymentService } from '../services/payment.service';
import { PaymentMethod } from '../entities/Payment';

const invoiceService = new InvoiceService();
const paymentService = new PaymentService();

/**
 * Get invoices for authenticated tenant
 */
export const getInvoices = async (req: Request, res: Response) => {
    try {
        const tenantId = (req as any).tenantId;
        if (!tenantId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const invoices = await invoiceService.getByTenant(tenantId);
        return res.json(invoices);
    } catch (error) {
        console.error('Get invoices error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const invoice = await invoiceService.getById(id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Check if user has access to this invoice
        const tenantId = (req as any).tenantId;
        const userRole = (req as any).user?.role;

        if (userRole !== 'SUPER_ADMIN' && invoice.tenant.id !== tenantId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        return res.json(invoice);
    } catch (error) {
        console.error('Get invoice error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get all invoices (admin only)
 */
export const getAllInvoices = async (req: Request, res: Response) => {
    try {
        const invoices = await invoiceService.getAll();
        return res.json(invoices);
    } catch (error) {
        console.error('Get all invoices error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Create manual invoice (admin only)
 */
export const createInvoice = async (req: Request, res: Response) => {
    try {
        const { tenantId, items, dueDate } = req.body;

        if (!tenantId || !items || !dueDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const invoice = await invoiceService.createManualInvoice(
            tenantId,
            items,
            new Date(dueDate)
        );

        return res.status(201).json(invoice);
    } catch (error) {
        console.error('Create invoice error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Record payment for invoice (admin only)
 */
export const recordPayment = async (req: Request, res: Response) => {
    try {
        const { invoiceId, amount, paymentMethod, notes, transactionId } = req.body;

        if (!invoiceId || !amount || !paymentMethod) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const payment = await paymentService.recordPayment(
            invoiceId,
            amount,
            paymentMethod as PaymentMethod,
            notes,
            transactionId
        );

        return res.status(201).json(payment);
    } catch (error) {
        console.error('Record payment error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get payments for tenant
 */
export const getPayments = async (req: Request, res: Response) => {
    try {
        const tenantId = (req as any).tenantId;
        if (!tenantId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const payments = await paymentService.getByTenant(tenantId);
        return res.json(payments);
    } catch (error) {
        console.error('Get payments error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get all payments (admin only)
 */
export const getAllPayments = async (req: Request, res: Response) => {
    try {
        const payments = await paymentService.getAll();
        return res.json(payments);
    } catch (error) {
        console.error('Get all payments error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get payment statistics (admin only)
 */
export const getPaymentStats = async (req: Request, res: Response) => {
    try {
        const stats = await paymentService.getStats();
        return res.json(stats);
    } catch (error) {
        console.error('Get payment stats error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
