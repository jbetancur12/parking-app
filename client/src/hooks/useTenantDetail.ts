import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    contactEmail?: string;
    plan: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    locations: Location[];
    users: User[];
}

export interface Location {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    isActive: boolean;
}

export interface User {
    id: number;
    username: string;
    role: string;
}

export const useTenantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'locations' | 'users'>('info');

    // Modal States
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showAddLocationModal, setShowAddLocationModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);

    // Form States
    const [newUser, setNewUser] = useState({ username: '', password: '', confirmPassword: '', role: 'OPERATOR' });
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newLocation, setNewLocation] = useState({ name: '', address: '', phone: '' });
    const [selectedPlan, setSelectedPlan] = useState('');

    useEffect(() => {
        if (user?.role !== 'SUPER_ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (id) {
            fetchTenantDetails();
        }
    }, [id]);

    const fetchTenantDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/tenants/${id}`);
            setTenant(response.data);
        } catch (error) {
            console.error('Error fetching tenant:', error);
            toast.error('Error al cargar empresa');
        } finally {
            setLoading(false);
        }
    };

    // --- Location Logic ---
    const createLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/locations', {
                ...newLocation,
                tenantId: id
            });
            toast.success('Sede creada exitosamente');
            setShowAddLocationModal(false);
            setNewLocation({ name: '', address: '', phone: '' });
            fetchTenantDetails();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Error al crear sede';
            toast.error(message);
        }
    };

    const handleDeleteLocation = async (locationId: string) => {
        if (!confirm('¿Está seguro de desactivar esta sede?')) return;

        try {
            await api.delete(`/admin/locations/${locationId}`);
            toast.success('Sede desactivada');
            fetchTenantDetails();
        } catch (error) {
            toast.error('Error al desactivar sede');
        }
    };

    const handleReactivateLocation = async (location: Location) => {
        try {
            await api.put(`/admin/locations/${location.id}`, { isActive: true });
            toast.success('Sede reactivada');
            fetchTenantDetails();
        } catch (error) {
            toast.error('Error al reactivar sede');
        }
    };

    // --- User Logic ---
    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (newUser.password !== newUser.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        try {
            if (editingUser) {
                // Update Logic
                const updateData: any = {
                    username: newUser.username,
                    role: newUser.role
                };
                if (newUser.password) {
                    updateData.password = newUser.password;
                }

                await api.put(`/users/${editingUser.id}`, updateData);
                toast.success('Usuario actualizado');
            } else {
                // Create Logic
                if (!newUser.password) {
                    toast.error('La contraseña es requerida');
                    return;
                }

                // 1. Create user
                const { confirmPassword, ...userData } = newUser;
                const createResponse = await api.post('/users', { ...userData, tenantId: id });
                const createdUserId = createResponse.data.id;

                // 2. Assign to tenant
                await api.post(`/admin/users/${createdUserId}/tenants`, {
                    tenantIds: [id]
                });

                toast.success('Usuario creado y asignado');
            }

            setShowAddUserModal(false);
            setNewUser({ username: '', password: '', confirmPassword: '', role: 'OPERATOR' });
            setEditingUser(null);
            fetchTenantDetails();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Error al guardar usuario';
            toast.error(message);
        }
    };

    const openCreateUserModal = () => {
        setEditingUser(null);
        setNewUser({ username: '', password: '', confirmPassword: '', role: 'OPERATOR' });
        setShowAddUserModal(true);
    };

    const openEditUserModal = (user: any) => {
        setEditingUser(user);
        setNewUser({
            username: user.username,
            password: '',
            confirmPassword: '',
            role: user.role
        });
        setShowAddUserModal(true);
    };

    const removeUserFromTenant = async (userId: number) => {
        if (!confirm('¿Remover acceso de este usuario?')) return;

        try {
            await api.delete(`/admin/users/${userId}/tenants/${id}`);
            toast.success('Usuario removido');
            fetchTenantDetails();
        } catch (error) {
            toast.error('Error al remover usuario');
        }
    };

    // --- Plan Logic ---
    const handleUpdatePlan = async () => {
        try {
            await api.put(`/admin/tenants/${id}`, { plan: selectedPlan });
            toast.success('Plan actualizado exitosamente');
            setShowPlanModal(false);
            fetchTenantDetails();
        } catch (error: any) {
            console.error('Error updating plan:', error);
            toast.error('Error al actualizar plan');
        }
    };

    const openPlanModal = () => {
        setSelectedPlan(tenant?.plan || 'basic');
        setShowPlanModal(true);
    };


    return {
        // Data & State
        tenant,
        loading,
        activeTab,
        setActiveTab,

        // Modals
        showAddUserModal,
        setShowAddUserModal,
        showAddLocationModal,
        setShowAddLocationModal,
        showPlanModal,
        setShowPlanModal,

        // Forms State
        newUser,
        setNewUser,
        editingUser,
        newLocation,
        setNewLocation,
        selectedPlan,
        setSelectedPlan,

        // Handlers
        createLocation,
        handleDeleteLocation,
        handleReactivateLocation,
        handleSubmitUser,
        openCreateUserModal,
        openEditUserModal,
        removeUserFromTenant,
        handleUpdatePlan,
        openPlanModal,
        navigate,
        id
    };
};
