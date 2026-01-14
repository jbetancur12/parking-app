import api from './api';
import type { Subscription, Invoice, Payment } from './billing.service';



export interface PaymentStats {
    totalRevenue: number;
    monthlyRevenue: number;
    pendingAmount: number;
}

export interface SubscriptionWithTenant extends Subscription {
    tenant: {
        id: string;
        name: string;
        slug: string;
        status: string;
    };
}

export interface InvoiceWithTenant extends Invoice {
    tenant: {
        id: string;
        name: string;
    };
}

export interface PaymentWithDetails extends Payment {
    tenant: {
        id: string;
        name: string;
    };
    invoice: {
        id: string;
        invoiceNumber: string;
    };
}

export const adminBillingService = {
    // Subscriptions
    async getAllSubscriptions(): Promise<SubscriptionWithTenant[]> {
        const response = await api.get(`/admin/billing/subscriptions`);
        return response.data;
    },

    // Invoices
    async getAllInvoices(): Promise<InvoiceWithTenant[]> {
        const response = await api.get(`/admin/billing/invoices`);
        return response.data;
    },

    async createInvoice(data: {
        tenantId: string;
        items: Array<{ description: string; quantity: number; unitPrice: number }>;
        dueDate: string;
    }): Promise<Invoice> {
        const response = await api.post(`/admin/billing/invoices`, data);
        return response.data;
    },

    // Payments
    async getAllPayments(): Promise<PaymentWithDetails[]> {
        const response = await api.get(`/admin/billing/payments`);
        return response.data;
    },

    async recordPayment(data: {
        invoiceId: string;
        amount: number;
        paymentMethod: 'card' | 'transfer' | 'cash' | 'other';
        notes?: string;
        transactionId?: string;
    }): Promise<Payment> {
        const response = await api.post(`/admin/billing/payments`, data);
        return response.data;
    },

    async getPaymentStats(): Promise<PaymentStats> {
        const response = await api.get(`/admin/billing/payments/stats`);
        return response.data;
    },
};
