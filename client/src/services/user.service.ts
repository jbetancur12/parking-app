import api from './api';

export interface User {
    id: number;
    username: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    tenants?: { id: string; name: string }[];
    locations?: { id: string; name: string }[];
}

export const userService = {
    async getAll(search?: string): Promise<User[]> {
        const params = search ? { search } : {};
        const response = await api.get('/users', { params });
        return response.data;
    },

    async update(id: number, data: Partial<User>): Promise<User> {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    async changePassword(userId: number, newPassword: string, currentPassword?: string): Promise<void> {
        await api.post('/users/change-password', { userId, newPassword, currentPassword });
    },

    async toggleStatus(userId: number, isActive: boolean): Promise<User> {
        const response = await api.put(`/users/${userId}`, { isActive });
        return response.data;
    },

    async unlock(userId: number): Promise<User> {
        return this.toggleStatus(userId, true);
    }
};
