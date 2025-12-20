import api from './api';

export interface Brand {
    id: number;
    name: string;
    isActive: boolean;
}

export const brandService = {
    getAll: async () => {
        const response = await api.get<Brand[]>('/brands');
        return response.data;
    },

    create: async (name: string) => {
        const response = await api.post<Brand>('/brands', { name });
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/brands/${id}`);
    }
};
