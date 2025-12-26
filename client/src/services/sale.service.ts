import api from './api';

export const saleService = {
    create: async (description: string, amount: number, paymentMethod: 'CASH' | 'TRANSFER' = 'CASH') => {
        const response = await api.post('/sales', { description, amount, paymentMethod });
        return response.data;
    },
    getAllByShift: async (shiftId: number) => {
        const response = await api.get(`/sales/shift/${shiftId}`);
        return response.data;
    }
};
