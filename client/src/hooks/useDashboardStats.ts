import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSaas } from '../context/SaasContext';

export const useDashboardStats = () => {
    const { user } = useAuth();
    const { currentLocation } = useSaas();

    const [stats, setStats] = useState<any>(null);
    const [occupancy, setOccupancy] = useState<any>(null);
    const [consolidatedData, setConsolidatedData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const isMounted = useRef(true);

    const fetchOccupancy = useCallback(async () => {
        if (!currentLocation) return;
        try {
            const response = await api.get('/stats/occupancy');
            if (isMounted.current) setOccupancy(response.data);
        } catch (error) {
            console.error('Error fetching occupancy:', error);
        }
    }, [currentLocation]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/stats/dashboard');
            if (isMounted.current) setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    const fetchConsolidatedStats = useCallback(async () => {
        try {
            // Use local date string YYYY-MM-DD, not UTC
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;

            const response = await api.get('/reports/consolidated', { params: { date: today } });
            if (isMounted.current) setConsolidatedData(response.data);
        } catch (error) {
            console.error('Error fetching consolidated stats:', error);
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;

        const loadInitialData = async () => {
            if (!currentLocation) {
                setLoading(false);
                return;
            }

            await fetchOccupancy();

            if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'LOCATION_MANAGER') {
                await Promise.all([fetchStats(), fetchConsolidatedStats()]);
            }

            if (isMounted.current) setLoading(false);
        };

        loadInitialData();

        // Polling for occupancy
        const interval = setInterval(() => {
            if (currentLocation) fetchOccupancy();
        }, 30000);

        return () => {
            isMounted.current = false;
            clearInterval(interval);
        };
    }, [user, currentLocation, fetchOccupancy, fetchStats, fetchConsolidatedStats]);

    return {
        stats,
        occupancy,
        consolidatedData,
        loading,
        refreshOccupancy: fetchOccupancy
    };
};
