import { useState, useEffect } from 'react';
import { subscriptionService, billingService, type Subscription, type Invoice, type PlanFeatures } from '../services/billing.service';

export function useBilling() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plans, setPlans] = useState<Record<string, PlanFeatures> | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBillingData();
    }, []);

    const loadBillingData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [subData, plansData, invoicesData] = await Promise.all([
                subscriptionService.getCurrentSubscription(),
                subscriptionService.getPlans(),
                billingService.getInvoices(),
            ]);

            setSubscription(subData);
            setPlans(plansData);
            setInvoices(invoicesData);
        } catch (err: any) {
            console.error('Failed to load billing data:', err);
            setError(err.response?.data?.message || 'Failed to load billing data');
        } finally {
            setLoading(false);
        }
    };

    const changePlan = async (newPlan: string) => {
        try {
            setLoading(true);
            const updated = await subscriptionService.changePlan(newPlan);
            setSubscription(updated);
            await loadBillingData(); // Reload all data
            return updated;
        } catch (err: any) {
            console.error('Failed to change plan:', err);
            throw new Error(err.response?.data?.message || 'Failed to change plan');
        } finally {
            setLoading(false);
        }
    };

    const cancelSubscription = async (immediately: boolean = false) => {
        try {
            setLoading(true);
            const updated = await subscriptionService.cancelSubscription(immediately);
            setSubscription(updated);
            return updated;
        } catch (err: any) {
            console.error('Failed to cancel subscription:', err);
            throw new Error(err.response?.data?.message || 'Failed to cancel subscription');
        } finally {
            setLoading(false);
        }
    };

    return {
        subscription,
        plans,
        invoices,
        loading,
        error,
        changePlan,
        cancelSubscription,
        reload: loadBillingData,
    };
}
