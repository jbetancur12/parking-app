import { useState, useEffect } from 'react';
import api from '../services/api';

export interface PricingPlan {
    id: string;
    name: string;
    slug: string;
    price: number;
    maxLocations: number;
    maxUsers: number;
    maxSessions: number;
    softLimitPercentage: number;
    hardLimitPercentage: number;
    isActive: boolean;
}

export const usePricingPlans = () => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const response = await api.get('/admin/pricing');
                setPlans(response.data.filter((p: PricingPlan) => p.isActive));
                setError(null);
            } catch (err: any) {
                console.error('Error fetching pricing plans:', err);
                setError(err.response?.data?.message || 'Error al cargar planes');
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    return { plans, loading, error };
};
