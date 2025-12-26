import api from './api';

export interface WashServiceType {
    id: number;
    name: string;
    price: number;
    vehicleType: string;
}

export interface WashEntryCreate {
    plate: string;
    serviceTypeId: number;
    operatorName?: string;
    price?: number;
    paymentMethod?: 'CASH' | 'TRANSFER';
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

    createEntry: async (shiftId: number, data: WashEntryCreate) => {
        const response = await api.post('/wash/entries', { ...data, shiftId });
        return response.data;
    },
    getAllByShift: async (shiftId: number) => {
        const response = await api.get<WashEntry[]>(`/wash/entries/shift/${shiftId}`);
        return response.data;
    },

    seed: async () => {
        await api.post('/wash/seed');
    }
};
