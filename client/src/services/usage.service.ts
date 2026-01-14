import api from './api';



export interface UsageLimits {
    sessions: {
        current: number;
        limit: number;
        softLimit: number;
        hardLimit: number;
        percentage: number;
        warningLevel?: 'soft' | 'critical' | 'blocked';
    };
    users: {
        current: number;
        limit: number;
        softLimit: number;
        hardLimit: number;
        percentage: number;
        warningLevel?: 'soft' | 'critical' | 'blocked';
    };
    locations: {
        current: number;
        limit: number;
        softLimit: number;
        hardLimit: number;
        percentage: number;
        warningLevel?: 'soft' | 'critical' | 'blocked';
    };
    planName?: string;
}

export const usageService = {
    async getCurrentUsage(): Promise<UsageLimits> {
        const response = await api.get('/usage/current');
        return response.data;
    },
};
