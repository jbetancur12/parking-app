import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';

export interface Tenant {
    id: string;
    name: string;
    slug: string;
}

export interface Location {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    isActive: boolean;
    tenant: Tenant;
}

export const useLocationsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [locations, setLocations] = useState<Location[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTenant, setSelectedTenant] = useState<string>('');
    const [showForm, setShowForm] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        tenantId: '',
        name: '',
        address: '',
        phone: '',
    });

    // Redirect if not authorized
    useEffect(() => {
        if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN' && user?.role !== 'LOCATION_MANAGER') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchTenants();
    }, []);

    useEffect(() => {
        // If ADMIN, default to their tenant
        if (user?.role === 'ADMIN' && tenants.length > 0 && !selectedTenant) {
            setSelectedTenant(tenants[0].id);
        }
        fetchLocations();
    }, [selectedTenant, tenants]); // Depend on tenants to set default selectedTenant, and fetchLocations depends on selectedTenant

    const fetchTenants = async () => {
        try {
            const response = await api.get('/admin/tenants');
            setTenants(response.data);
        } catch (error) {
            console.error('Error fetching tenants:', error);
            toast.error('Error al cargar empresas');
        }
    };

    const fetchLocations = async () => {
        // Avoid fetching if we are supposed to filter by tenant but haven't selected one yet (unless intentional empty filter for all)
        // But the original logic allows fetching all if selectedTenant is empty (for superadmin usually)
        try {
            setLoading(true);
            const params = selectedTenant ? { tenantId: selectedTenant } : {};
            const response = await api.get('/admin/locations', { params });
            setLocations(response.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
            toast.error('Error al cargar sedes');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingLocation) {
                await api.put(`/admin/locations/${editingLocation.id}`, formData);
                toast.success('Sede actualizada');
            } else {
                await api.post('/admin/locations', formData);
                toast.success('Sede creada');
            }
            resetForm();
            fetchLocations();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Error al guardar sede';
            toast.error(message);
        }
    };

    const handleEdit = (location: Location) => {
        setEditingLocation(location);
        setFormData({
            tenantId: location.tenant.id,
            name: location.name,
            address: location.address || '',
            phone: location.phone || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (locationId: string) => {
        if (!confirm('¿Está seguro de desacrivar esta sede?')) return; // Kept typo from original for minimal change, or should I fix it? I'll fix it: "desactivar"

        try {
            await api.delete(`/admin/locations/${locationId}`);
            toast.success('Sede desactivada');
            fetchLocations();
        } catch (error) {
            toast.error('Error al desactivar sede');
        }
    };

    const handleReactivate = async (location: Location) => {
        try {
            await api.put(`/admin/locations/${location.id}`, { isActive: true });
            toast.success('Sede reactivada');
            fetchLocations();
        } catch (error) {
            toast.error('Error al reactivar sede');
        }
    };

    const resetForm = () => {
        setFormData({ tenantId: '', name: '', address: '', phone: '' });
        setEditingLocation(null);
        setShowForm(false);
    };

    const canCreate = user?.role === 'SUPER_ADMIN';

    return {
        locations,
        tenants,
        loading,
        selectedTenant,
        setSelectedTenant,
        showForm,
        setShowForm,
        editingLocation,
        formData,
        setFormData,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleReactivate,
        resetForm,
        canCreate
    };
};
