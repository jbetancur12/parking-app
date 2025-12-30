// Custom hook for Monthly Clients logic
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { settingService } from '../services/setting.service';
import { toast } from 'sonner';

export interface Client {
    id: number;
    plate: string;
    name: string;
    phone?: string;
    vehicleType?: string;
    startDate: string;
    endDate: string;
    monthlyRate: number;
    isActive: boolean;
}

export type FilterStatus = 'ALL' | 'ACTIVE' | 'EXPIRED';

export const useMonthlyClients = () => {
    // Data State
    const [clients, setClients] = useState<Client[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/monthly?search=${searchTerm}`);
            setClients(response.data);
        } catch (err) {
            console.error(err);
            toast.error('Error al cargar clientes');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    const fetchSettings = useCallback(async () => {
        try {
            const data = await settingService.getAll();
            setSettings(data);
        } catch (error) {
            console.error('Error loading settings', error);
        }
    }, []);

    useEffect(() => {
        fetchClients();
        fetchSettings();
    }, [fetchClients, fetchSettings]);

    // Computed Properties
    const filteredClients = clients.filter(client => {
        if (searchTerm) return true;
        const now = new Date();
        const endDate = new Date(client.endDate);
        const isExpired = endDate < now;

        if (filterStatus === 'ACTIVE') return client.isActive && !isExpired;
        if (filterStatus === 'EXPIRED') return client.isActive && isExpired;
        if (filterStatus === 'ALL') return client.isActive;
        return true;
    });

    // Actions
    const createClient = async (data: any) => {
        const response = await api.post('/monthly', data);
        await fetchClients();
        return response.data;
    };

    const renewClient = async (id: number, data: { amount: number, paymentMethod: string }) => {
        const response = await api.post(`/monthly/${id}/renew`, data);
        await fetchClients();
        return response.data;
    };

    const toggleStatus = async (id: number) => {
        await api.patch(`/monthly/${id}/status`);
        await fetchClients();
    };

    const anonymizeClient = async (id: number) => {
        await api.post(`/monthly/${id}/anonymize`);
        await fetchClients();
    };

    const getHistory = async (id: number) => {
        const response = await api.get(`/monthly/${id}/history`);
        return response.data;
    };

    return {
        clients: filteredClients,
        allClients: clients, // Raw list if needed
        settings,
        loading,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        refresh: fetchClients,
        createClient,
        renewClient,
        toggleStatus,
        anonymizeClient,
        getHistory
    };
};
