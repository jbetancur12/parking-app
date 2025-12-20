import api from './api';

export interface WashServiceType {
    id: number;
    name: string;
    price: number;
    vehicleType: string;
}

export interface WashEntry {
    id: number;
    plate: string;
    operatorName?: string;
    cost: number;
    createdAt: string;
}

export const washService = {
    getTypes: async () => {
        const response = await api.get<WashServiceType[]>('/wash/types');
        return response.data;
    },

    createEntry: async (shiftId: number, data: { plate: string; serviceTypeId: number; operatorName?: string }) => {
        const response = await api.post('/wash/entries', { ...data, shiftId });
        return response.data;
    },

    seed: async () => {
        await api.post('/wash/seed');
    }
};
