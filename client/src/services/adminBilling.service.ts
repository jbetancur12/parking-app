import axios from 'axios';
import type { Subscription, Invoice, Payment } from './billing.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
        const response = await axios.get(`${API_URL}/admin/billing/subscriptions`);
        return response.data;
    },

    // Invoices
    async getAllInvoices(): Promise<InvoiceWithTenant[]> {
        const response = await axios.get(`${API_URL}/admin/billing/invoices`);
        return response.data;
    },

    async createInvoice(data: {
        tenantId: string;
        items: Array<{ description: string; quantity: number; unitPrice: number }>;
        dueDate: string;
    }): Promise<Invoice> {
        const response = await axios.post(`${API_URL}/admin/billing/invoices`, data);
        return response.data;
    },

    // Payments
    async getAllPayments(): Promise<PaymentWithDetails[]> {
        const response = await axios.get(`${API_URL}/admin/billing/payments`);
        return response.data;
    },

    async recordPayment(data: {
        invoiceId: string;
        amount: number;
        paymentMethod: 'card' | 'transfer' | 'cash' | 'other';
        notes?: string;
        transactionId?: string;
    }): Promise<Payment> {
        const response = await axios.post(`${API_URL}/admin/billing/payments`, data);
        return response.data;
    },

    async getPaymentStats(): Promise<PaymentStats> {
        const response = await axios.get(`${API_URL}/admin/billing/payments/stats`);
        return response.data;
    },
};
