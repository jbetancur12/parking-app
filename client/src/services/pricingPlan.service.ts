import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface PricingPlan {
    id: string;
    code: string;
    name: string;
    price: number;
    billingPeriod: string;
    maxLocations: number;
    maxUsers: number;
    maxSessions: number;
    features: string[];
    featureFlags?: Record<string, boolean>; // Dynamic toggles
    support: string;
    softLimitPercentage: number;
    hardLimitPercentage: number;
    isPublic: boolean;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export const pricingPlanService = {
    async getAllPlans(includeInactive: boolean = false): Promise<PricingPlan[]> {
        const params = includeInactive ? '?includeInactive=true' : '';
        const response = await api.get(`${API_URL}/admin/pricing/plans${params}`);
        return response.data;
    },

    async getPlanByCode(code: string): Promise<PricingPlan> {
        const response = await api.get(`${API_URL}/admin/pricing/plans/${code}`);
        return response.data;
    },

    async updatePlan(code: string, data: Partial<PricingPlan>): Promise<PricingPlan> {
        const response = await api.put(`${API_URL}/admin/pricing/plans/${code}`, data);
        return response.data.plan;
    },

    async createPlan(data: Partial<PricingPlan>): Promise<PricingPlan> {
        const response = await api.post(`${API_URL}/admin/pricing/plans`, data);
        return response.data;
    },

    async toggleStatus(code: string, isActive: boolean): Promise<PricingPlan> {
        const response = await api.patch(`${API_URL}/admin/pricing/plans/${code}/status`, { isActive });
        return response.data.plan;
    },
};
