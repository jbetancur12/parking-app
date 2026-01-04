import { useState, useEffect } from 'react';
import { adminBillingService, type SubscriptionWithTenant, type InvoiceWithTenant, type PaymentWithDetails, type PaymentStats } from '../services/adminBilling.service';

export function useAdminBilling() {
    const [subscriptions, setSubscriptions] = useState<SubscriptionWithTenant[]>([]);
    const [invoices, setInvoices] = useState<InvoiceWithTenant[]>([]);
    const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [subsData, invoicesData, paymentsData, statsData] = await Promise.all([
                adminBillingService.getAllSubscriptions(),
                adminBillingService.getAllInvoices(),
                adminBillingService.getAllPayments(),
                adminBillingService.getPaymentStats(),
            ]);

            setSubscriptions(subsData);
            setInvoices(invoicesData);
            setPayments(paymentsData);
            setStats(statsData);
        } catch (err: any) {
            console.error('Failed to load admin billing data:', err);
            setError(err.response?.data?.message || 'Failed to load billing data');
        } finally {
            setLoading(false);
        }
    };

    const createInvoice = async (data: {
        tenantId: string;
        items: Array<{ description: string; quantity: number; unitPrice: number }>;
        dueDate: string;
    }) => {
        try {
            await adminBillingService.createInvoice(data);
            await loadData(); // Reload all data
        } catch (err: any) {
            console.error('Failed to create invoice:', err);
            throw new Error(err.response?.data?.message || 'Failed to create invoice');
        }
    };

    const recordPayment = async (data: {
        invoiceId: string;
        amount: number;
        paymentMethod: 'card' | 'transfer' | 'cash' | 'other';
        notes?: string;
        transactionId?: string;
    }) => {
        try {
            await adminBillingService.recordPayment(data);
            await loadData(); // Reload all data
        } catch (err: any) {
            console.error('Failed to record payment:', err);
            throw new Error(err.response?.data?.message || 'Failed to record payment');
        }
    };

    return {
        subscriptions,
        invoices,
        payments,
        stats,
        loading,
        error,
        createInvoice,
        recordPayment,
        reload: loadData,
    };
}
