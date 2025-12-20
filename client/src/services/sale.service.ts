import api from './api';

export const saleService = {
    create: async (description: string, amount: number) => {
        const response = await api.post('/sales', { description, amount });
        return response.data;
    }
};
