import api from './api';

export const settingService = {
    getAll: async () => {
        const response = await api.get('/settings');
        return response.data;
    },
    update: async (settings: Record<string, string>) => {
        const response = await api.post('/settings', settings);
        return response.data;
    }
};
