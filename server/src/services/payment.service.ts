import { RequestContext } from '@mikro-orm/core';
import { Payment, PaymentStatus, PaymentMethod } from '../entities/Payment';
import { Invoice } from '../entities/Invoice';
import { Tenant } from '../entities/Tenant';
import { InvoiceService } from './invoice.service';

export class PaymentService {
    private invoiceService = new InvoiceService();

    /**
     * Record a manual payment (admin)
     */
    async recordPayment(
        invoiceId: string,
        amount: number,
        paymentMethod: PaymentMethod,
        notes?: string,
        transactionId?: string
    ): Promise<Payment> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const invoice = await em.findOne(Invoice, { id: invoiceId }, {
            populate: ['tenant']
        });
        if (!invoice) throw new Error('Invoice not found');

        const payment = em.create(Payment, {
            tenant: invoice.tenant,
            invoice,
            amount,
            currency: invoice.currency,
            status: PaymentStatus.COMPLETED,
            paymentMethod,
            transactionId,
            notes,
            processedAt: new Date(),
        } as any);

        await em.persistAndFlush(payment);

        // Mark invoice as paid if payment covers total
        if (amount >= invoice.total) {
            await this.invoiceService.markAsPaid(invoiceId);
        }

        return payment;
    }

    /**
     * Process a refund
     */
    async processRefund(paymentId: string, amount?: number): Promise<Payment> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const payment = await em.findOne(Payment, { id: paymentId });
        if (!payment) throw new Error('Payment not found');

        if (payment.status !== PaymentStatus.COMPLETED) {
            throw new Error('Can only refund completed payments');
        }

        const refundAmount = amount || payment.amount;

        // Create refund payment record
        const refund = em.create(Payment, {
            tenant: payment.tenant,
            invoice: payment.invoice,
            amount: -refundAmount,
            currency: payment.currency,
            status: PaymentStatus.REFUNDED,
            paymentMethod: payment.paymentMethod,
            notes: `Refund for payment ${payment.id}`,
            processedAt: new Date(),
        } as any);

        // Update original payment status
        payment.status = PaymentStatus.REFUNDED;

        await em.flush();
        return refund;
    }

    /**
     * Get payment history for a tenant
     */
    async getByTenant(tenantId: string): Promise<Payment[]> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        return await em.find(Payment, { tenant: tenantId }, {
            populate: ['invoice'],
            orderBy: { createdAt: 'DESC' }
        });
    }

    /**
     * Get payments for an invoice
     */
    async getByInvoice(invoiceId: string): Promise<Payment[]> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        return await em.find(Payment, { invoice: invoiceId }, {
            orderBy: { createdAt: 'DESC' }
        });
    }

    /**
     * Get all payments (admin)
     */
    async getAll(): Promise<Payment[]> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        return await em.find(Payment, {}, {
            populate: ['tenant', 'invoice'],
            orderBy: { createdAt: 'DESC' }
        });
    }

    /**
     * Get payment statistics (admin)
     */
    async getStats(): Promise<{
        totalRevenue: number;
        monthlyRevenue: number;
        pendingAmount: number;
    }> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const completedPayments = await em.find(Payment, {
            status: PaymentStatus.COMPLETED
        });

        const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyPayments = completedPayments.filter(p => p.createdAt >= monthStart);
        const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

        const pendingPayments = await em.find(Payment, {
            status: PaymentStatus.PENDING
        });
        const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

        return {
            totalRevenue,
            monthlyRevenue,
            pendingAmount
        };
    }
}
