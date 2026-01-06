import api from '../services/api';

export interface FeatureDefinition {
    id: number;
    key: string;
    description: string;
    category?: string;
    createdAt: string;
    updatedAt: string;
}

export const getFeatures = async (): Promise<FeatureDefinition[]> => {
    const response = await api.get('/admin/features');
    return response.data;
};

export const createFeature = async (data: { key: string; description: string; category?: string }) => {
    const response = await api.post('/admin/features', data);
    return response.data;
};

export const updateFeature = async (id: number, data: { description?: string; category?: string }) => {
    const response = await api.put(`/admin/features/${id}`, data);
    return response.data;
};

export const deleteFeature = async (id: number) => {
    const response = await api.delete(`/admin/features/${id}`);
    return response.data;
};
