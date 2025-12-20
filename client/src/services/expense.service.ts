import api from './api';

export interface Expense {
    id: number;
    description: string;
    amount: number;
    createdAt: string;
    shift: number;
}

export const expenseService = {
    create: async (shiftId: number, description: string, amount: number) => {
        const response = await api.post('/expenses', { shiftId, description, amount });
        return response.data;
    },

    getAllByShift: async (shiftId: number) => {
        const response = await api.get<Expense[]>(`/expenses/shift/${shiftId}`);
        return response.data;
    }
};
