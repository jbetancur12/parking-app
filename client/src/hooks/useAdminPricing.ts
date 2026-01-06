import { useState, useEffect } from 'react';
import { pricingPlanService, type PricingPlan } from '../services/pricingPlan.service';

export function useAdminPricing() {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await pricingPlanService.getAllPlans(true); // Include inactive
            setPlans(data);
        } catch (err: any) {
            console.error('Failed to load pricing plans:', err);
            setError(err.response?.data?.message || 'Failed to load pricing plans');
        } finally {
            setLoading(false);
        }
    };

    const updatePlan = async (code: string, data: Partial<PricingPlan>) => {
        try {
            const updated = await pricingPlanService.updatePlan(code, data);
            setPlans(prev => prev.map(p => p.code === code ? updated : p));
            return updated;
        } catch (err: any) {
            console.error('Failed to update plan:', err);
            throw new Error(err.response?.data?.message || 'Failed to update plan');
        }
    };

    const toggleStatus = async (code: string, isActive: boolean) => {
        try {
            const updated = await pricingPlanService.toggleStatus(code, isActive);
            setPlans(prev => prev.map(p => p.code === code ? updated : p));
            return updated;
        } catch (err: any) {
            console.error('Failed to toggle plan status:', err);
            throw new Error(err.response?.data?.message || 'Failed to toggle plan status');
        }
    };

    const createPlan = async (data: Partial<PricingPlan>) => {
        try {
            const newPlan = await pricingPlanService.createPlan(data);
            setPlans(prev => [...prev, newPlan]);
            return newPlan;
        } catch (err: any) {
            console.error('Failed to create plan:', err);
            throw new Error(err.response?.data?.message || 'Failed to create plan');
        }
    };

    return {
        plans,
        loading,
        error,
        createPlan,
        updatePlan,
        toggleStatus,
        reload: loadPlans,
    };
}
