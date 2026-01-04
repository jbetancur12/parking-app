import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Subscription {
    id: string;
    plan: string;
    status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'unpaid';
    amount: number;
    currency: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialStart?: string;
    trialEnd?: string;
}

export interface PlanFeatures {
    name: string;
    price: number;
    maxLocations: number;
    maxUsers: number;
    maxSessions: number;
    features: string[];
    support: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    dueDate: string;
    paidAt?: string;
    createdAt: string;
}

export interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: 'card' | 'transfer' | 'cash' | 'other';
    processedAt?: string;
    createdAt: string;
}

export const subscriptionService = {
    async getCurrentSubscription(): Promise<Subscription> {
        const response = await api.get(`${API_URL}/subscription/current`);
        return response.data;
    },

    async getPlans(): Promise<Record<string, PlanFeatures>> {
        const response = await api.get(`${API_URL}/subscription/plans`);
        return response.data;
    },

    async changePlan(plan: string): Promise<Subscription> {
        const response = await api.post(`${API_URL}/subscription/change-plan`, { plan });
        return response.data.subscription;
    },

    async cancelSubscription(immediately: boolean = false): Promise<Subscription> {
        const response = await api.post(`${API_URL}/subscription/cancel`, { immediately });
        return response.data.subscription;
    },
};

export const billingService = {
    async getInvoices(): Promise<Invoice[]> {
        const response = await api.get(`${API_URL}/billing/invoices`);
        return response.data;
    },

    async getInvoiceById(id: string): Promise<Invoice> {
        const response = await api.get(`${API_URL}/billing/invoices/${id}`);
        return response.data;
    },

    async getPayments(): Promise<Payment[]> {
        const response = await api.get(`${API_URL}/billing/payments`);
        return response.data;
    },
};
