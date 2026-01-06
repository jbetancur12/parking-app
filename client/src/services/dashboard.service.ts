import api from './api';

export interface DashboardMetrics {
    totalTenants: number;
    activeTenants: number;
    inactiveTenants: number;
    mrr: number;
    totalUsers: number;
    activeUsers: number;
    activeUsersPercentage: number;
}

export interface ChurnMetrics {
    period: number;
    tenantsAtStart: number;
    churnedTenants: number;
    churnRate: number;
}

export interface LTVMetrics {
    averageLTV: number;
    averageLifetimeMonths: number;
    averageMonthlyRevenue: number;
}

export interface ActiveUsageMetrics {
    totalUsers: number;
    activeLastWeek: number;
    activeLastMonth: number;
    inactiveUsers: number;
    activeWeekPercentage: number;
    activeMonthPercentage: number;
}

export interface TrendData {
    month: string;
    newTenants: number;
    totalTenants: number;
    mrr: number;
}

export const dashboardService = {
    async getMetrics(): Promise<DashboardMetrics> {
        const response = await api.get('/admin/dashboard/metrics');
        return response.data;
    },

    async getChurn(period: number = 30): Promise<ChurnMetrics> {
        const response = await api.get('/admin/dashboard/churn', { params: { period } });
        return response.data;
    },

    async getLTV(): Promise<LTVMetrics> {
        const response = await api.get('/admin/dashboard/ltv');
        return response.data;
    },

    async getActiveUsage(): Promise<ActiveUsageMetrics> {
        const response = await api.get('/admin/dashboard/active-usage');
        return response.data;
    },

    async getTrends(months: number = 6): Promise<TrendData[]> {
        const response = await api.get('/admin/dashboard/trends', { params: { months } });
        return response.data;
    }
};
