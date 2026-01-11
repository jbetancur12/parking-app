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
                // Create Logic (Invitation Flow)
                // 1. Create user with isInvitation flag
                const { confirmPassword, ...userData } = newUser;

                // Generate a placeholder password since backend requires it but won't use it for hashing if isInvitation is true (it randomizes it)
                const placeholderPassword = 'tmp-invite-' + Date.now();

                const createResponse = await api.post('/users', {
                    ...userData,
                    password: placeholderPassword,
                    tenantId: id,
                    isInvitation: true
                });
                const createdUserId = createResponse.data.id;

                // 2. Assign to tenant (Already handled by create user with tenantId logic? 
                // Let's check user.controller. It handles 'currentTenantId' from context or body.
                // We are passing tenantId: id in body.
                // However, user.controller check lines 136-150: if existing user, it adds to tenant.
                // If new user, line 214: adds to tenant if currentTenantId is present.
                // So explicit assignment endpoint call might be redundant if we pass tenantId correctly. 
                // But let's keep it safe or just rely oncreate if we are sure.
                // Actually the previous code did explicit assignment. Let's keep it if we want to be 100% sure, 
                // BUT the API call `api.post('/users', { ...tenantId: id })` should do it if controller logic holds.
                // Let's look at controller logic again.
                // Controller: const currentTenantId = (req as any).tenant?.id || bodyTenantId;
                // If we are ADMIN hitting this, req.tenant?.id is set.
                // If we are SUPER_ADMIN hitting this, req.tenant is null likely? No, SAAS middleware sets it.
                // But wait, this is `useTenantDetail` usually used by SUPER_ADMIN?
                // If SUPER_ADMIN, they can navigate to any tenant. Context might not be set to THAT tenant in headers.
                // So passing tenantId in body is CRITICAL.
                // Let's keep the explicit assignment only if the create didn't do it?
                // But the 'create' endpoint at the end does: if (currentTenantId) { user.tenants.add(tenant) }
                // So passing tenantId is enough.
                // Using explicit assignment *as well* doesn't hurt, but creates 2 requests.
                // I'll keep the logic simple: Trust the create endpoint if it works, but since I can't verify backend right now easily without risking breakage, I will stick to "create then assign" pattern if that was the working state, 
                // OR better: Create handles it if I send tenantId. 
                // Let's stick to sending tenantId in create.
                // Remove explicit assignment if possible to clean up, but wait... 
                // The previous code did: await api.post(`/admin/users/${createdUserId}/tenants`...
                // I'll keep the explicit assignment call for safety as I am not changing that logic, only the password part.

                // Actually, if I am cleaning up, let's just make sure Create works.
                // I will Comment out the explicit assignment if I am confident, but to be SAFE and minimize regressions:
                // I will keep sending tenantId in create, and if that works, the second call will just be a no-op or valid "add again".
                // Wait, User Controller "create" already checks if user assigned. 
                // Let's just focus on removing password requirement.

                await api.post(`/admin/users/${createdUserId}/tenants`, {
                    tenantIds: [id]
                });

                toast.success('Usuario invitado y asignado correctamente');
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
