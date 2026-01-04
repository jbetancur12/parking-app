import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    contactEmail?: string;
    plan: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    locationsCount: number;
    usersCount: number;
}

export type FilterType = 'all' | 'active' | 'suspended';

export const useTenantsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [showPlansModal, setShowPlansModal] = useState(false);

    // Redirect if not SUPER_ADMIN
    useEffect(() => {
        if (user?.role !== 'SUPER_ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchTenants();
    }, [filter]);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await api.get('/admin/tenants', { params });
            setTenants(response.data);
        } catch (error) {
            console.error('Error fetching tenants:', error);
            toast.error('Error al cargar empresas');
        } finally {
            setLoading(false);
        }
    };

    const toggleTenantStatus = async (tenantId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
            await api.patch(`/admin/tenants/${tenantId}/status`, { status: newStatus });
            toast.success(`Empresa ${newStatus === 'active' ? 'activada' : 'suspendida'}`);
            fetchTenants();
        } catch (error) {
            console.error('Error updating tenant status:', error);
            toast.error('Error al cambiar estado');
        }
    };

    return {
        tenants,
        loading,
        filter,
        setFilter,
        showPlansModal,
        setShowPlansModal,
        toggleTenantStatus,
        navigate // Expose navigate for list actions
    };
};
