import api from './api';

export type PricingModel = 'MINUTE' | 'BLOCKS' | 'TRADITIONAL';

export interface Tariff {
    id: number;
    vehicleType: 'CAR' | 'MOTORCYCLE' | 'OTHER';
    tariffType: 'MINUTE' | 'HOUR' | 'DAY' | 'NIGHT' | 'MONTH';
    cost: number;
    pricingModel?: PricingModel;
    basePrice?: number;
    baseTimeMinutes?: number;
    extraFracPrice?: number;
    extraFracTimeMinutes?: number;
    dayMaxPrice?: number;
    dayMinHours?: number;
    description?: string;
}

export const tariffService = {
    getAll: async () => {
        const response = await api.get('/tariffs');
        return response.data;
    },
    update: async (tariffs: Partial<Tariff>[]) => {
        const response = await api.post('/tariffs', tariffs);
        return response.data;
    },
    seed: async () => {
        const response = await api.post('/tariffs/seed', {});
        return response.data;
    }
};
