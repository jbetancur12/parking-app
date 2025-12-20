import api from './api';

export const saleService = {
    create: async (description: string, amount: number) => {
        const response = await api.post('/sales', { description, amount });
        return response.data;
    },
    getAllByShift: async (shiftId: number) => {
        const response = await api.get(`/sales/shift/${shiftId}`);
        return response.data;
    }
};
