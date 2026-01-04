import { useEffect, useState } from 'react';
import api from '../services/api';

interface SuperAdminStats {
    counts: {
        tenants: number;
        locations: number;
        users: number;
        revenue: number;
    };
    activity: {
        id: number;
        description: string;
        amount: number;
        timestamp: string;
        tenant: string;
        location: string;
    }[];
}

export const useSuperAdminStats = () => {
    const [stats, setStats] = useState<SuperAdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/stats/super-admin');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch super admin stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading };
};
