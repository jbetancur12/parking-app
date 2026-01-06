import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardMetrics, ChurnMetrics, LTVMetrics, ActiveUsageMetrics, TrendData } from '../services/dashboard.service';

export const useAdminDashboard = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [churn, setChurn] = useState<ChurnMetrics | null>(null);
    const [ltv, setLTV] = useState<LTVMetrics | null>(null);
    const [activeUsage, setActiveUsage] = useState<ActiveUsageMetrics | null>(null);
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [metricsData, churnData, ltvData, activeUsageData, trendsData] = await Promise.all([
                dashboardService.getMetrics(),
                dashboardService.getChurn(30),
                dashboardService.getLTV(),
                dashboardService.getActiveUsage(),
                dashboardService.getTrends(6)
            ]);

            setMetrics(metricsData);
            setChurn(churnData);
            setLTV(ltvData);
            setActiveUsage(activeUsageData);
            setTrends(trendsData);
        } catch (err: any) {
            console.error('Error loading dashboard data:', err);
            setError(err.message || 'Error cargando datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    return {
        metrics,
        churn,
        ltv,
        activeUsage,
        trends,
        loading,
        error,
        refresh: loadDashboardData
    };
};
