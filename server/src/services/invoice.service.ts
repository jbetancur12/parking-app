import { RequestContext } from '@mikro-orm/core';
import { Invoice, InvoiceStatus } from '../entities/Invoice';
import { InvoiceItem } from '../entities/InvoiceItem';
import { Subscription } from '../entities/Subscription';
import { Tenant } from '../entities/Tenant';
import { format } from 'date-fns';

export class InvoiceService {
    /**
     * Generate monthly invoice for a subscription
     */
    async generateMonthlyInvoice(subscriptionId: string): Promise<Invoice> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const subscription = await em.findOne(Subscription, { id: subscriptionId }, {
            populate: ['tenant']
        });
        if (!subscription) throw new Error('Subscription not found');

        const invoiceNumber = await this.generateInvoiceNumber();

        const invoice = em.create(Invoice, {
            tenant: subscription.tenant,
            subscription,
            invoiceNumber,
            status: InvoiceStatus.OPEN,
            subtotal: subscription.amount,
            tax: 0,
            total: subscription.amount,
            currency: subscription.currency,
            dueDate: subscription.currentPeriodEnd,
        } as any);

        // Add line item
        const item = em.create(InvoiceItem, {
            invoice,
            description: `${subscription.plan.toUpperCase()} Plan - Monthly Subscription`,
            quantity: 1,
            unitPrice: subscription.amount,
            amount: subscription.amount,
        } as any);

        await em.persistAndFlush([invoice, item]);
        return invoice;
    }

    /**
     * Create a manual invoice (admin)
     */
    async createManualInvoice(
        tenantId: string,
        items: Array<{ description: string; quantity: number; unitPrice: number }>,
        dueDate: Date
    ): Promise<Invoice> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const tenant = await em.findOne(Tenant, { id: tenantId });
        if (!tenant) throw new Error('Tenant not found');

        const invoiceNumber = await this.generateInvoiceNumber();
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        const invoice = em.create(Invoice, {
            tenant,
            invoiceNumber,
            status: InvoiceStatus.OPEN,
            subtotal,
            tax: 0,
            total: subtotal,
            currency: 'USD',
            dueDate,
        } as any);

        // Create invoice items
        const invoiceItems = items.map(item =>
            em.create(InvoiceItem, {
                invoice,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.quantity * item.unitPrice,
            } as any)
        );

        await em.persistAndFlush([invoice, ...invoiceItems]);
        return invoice;
    }

    /**
     * Mark invoice as paid
     */
    async markAsPaid(invoiceId: string): Promise<Invoice> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const invoice = await em.findOne(Invoice, { id: invoiceId });
        if (!invoice) throw new Error('Invoice not found');

        invoice.status = InvoiceStatus.PAID;
        invoice.paidAt = new Date();

        await em.flush();
        return invoice;
    }

    /**
     * Void an invoice
     */
    async voidInvoice(invoiceId: string): Promise<Invoice> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const invoice = await em.findOne(Invoice, { id: invoiceId });
        if (!invoice) throw new Error('Invoice not found');

        invoice.status = InvoiceStatus.VOID;
        invoice.voidedAt = new Date();

        await em.flush();
        return invoice;
    }

    /**
     * Get invoices for a tenant
     */
    async getByTenant(tenantId: string): Promise<Invoice[]> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        return await em.find(Invoice, { tenant: tenantId }, {
            populate: ['items', 'payments'],
            orderBy: { createdAt: 'DESC' }
        });
    }

    /**
     * Get invoice by ID
     */
    async getById(invoiceId: string): Promise<Invoice | null> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        return await em.findOne(Invoice, { id: invoiceId }, {
            populate: ['tenant', 'items', 'payments']
        });
    }

    /**
     * Get all invoices (admin)
     */
    async getAll(): Promise<Invoice[]> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        return await em.find(Invoice, {}, {
            populate: ['tenant', 'items'],
            orderBy: { createdAt: 'DESC' }
        });
    }

    /**
     * Generate unique invoice number
     */
    private async generateInvoiceNumber(): Promise<string> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const year = format(new Date(), 'yyyy');
        const count = await em.count(Invoice, {
            invoiceNumber: { $like: `INV-${year}-%` }
        });

        const number = String(count + 1).padStart(4, '0');
        return `INV-${year}-${number}`;
    }
}
