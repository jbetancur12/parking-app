import api from './api';

export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    minStock: number;
    isActive: boolean;
}

export interface CreateProductDto {
    name: string;
    price: number;
    stock?: number;
    minStock?: number;
}

export const productService = {
    getAll: async () => {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },

    create: async (data: CreateProductDto) => {
        const response = await api.post<Product>('/products', data);
        return response.data;
    },

    update: async (id: number, data: Partial<CreateProductDto>) => {
        const response = await api.put<Product>(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/products/${id}`);
    }
};
