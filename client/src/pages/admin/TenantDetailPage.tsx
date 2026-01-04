import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ArrowLeft, Building2, MapPin, Users, Edit, Trash2, Plus, UserPlus, CheckCircle, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Tenant {
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

interface Location {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    isActive: boolean;
}

interface User {
    id: number;
    username: string;
    role: string;
}

const SAAS_PLANS: Record<string, { maxLocations: number; maxUsers: number; price: number; label: string }> = {
    basic: { maxLocations: 1, maxUsers: 2, price: 50000, label: 'Básico' },
    trial: { maxLocations: 1, maxUsers: 2, price: 0, label: 'Prueba (14 Días)' },
    pro: { maxLocations: 5, maxUsers: 10, price: 150000, label: 'Pro' },
    enterprise: { maxLocations: 100, maxUsers: 1000, price: 300000, label: 'Enterprise' }
};

export default function TenantDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'locations' | 'users'>('info');

    // User management state
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', confirmPassword: '', role: 'OPERATOR' });
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Location management state
    const [showAddLocationModal, setShowAddLocationModal] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: '', address: '', phone: '' });

    // Plan management state
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('');

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

    if (loading) {
        return <div className="p-8 text-center">Cargando...</div>;
    }

    if (!tenant) {
        return <div className="p-8 text-center">Empresa no encontrada</div>;
    }

    const tabs = [
        { id: 'info', label: 'Información', icon: Building2 },
        { id: 'locations', label: 'Sedes', icon: MapPin },
        { id: 'users', label: 'Usuarios', icon: Users },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/tenants')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-brand-blue dark:text-white">{tenant.name}</h1>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">@{tenant.slug}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/admin/tenants/${id}/edit`)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-colors"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Empresa
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-brand-blue text-brand-blue dark:text-blue-400 dark:border-blue-400 font-bold'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
                {activeTab === 'info' && (
                    <dl className="grid grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Plan Actual</dt>
                            <dd className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase
                                    ${tenant.plan === 'enterprise' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                        tenant.plan === 'pro' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                                    {tenant.plan}
                                </span>
                                <button
                                    onClick={openPlanModal}
                                    className="text-xs text-brand-blue dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-semibold transition-colors"
                                >
                                    Cambiar Plan
                                </button>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Estado</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full
                                    ${tenant.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                    {tenant.status}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Email de Contacto</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{tenant.contactEmail || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Fecha de Creación</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                {new Date(tenant.createdAt).toLocaleDateString()}
                            </dd>
                        </div>
                    </dl>
                )}

                {activeTab === 'locations' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-display font-bold text-brand-blue dark:text-blue-300">Sedes</h3>
                            <button
                                onClick={() => setShowAddLocationModal(true)}
                                className="flex items-center px-4 py-2 bg-brand-yellow dark:bg-yellow-500 text-brand-blue dark:text-gray-900 font-bold rounded-lg hover:bg-yellow-400 dark:hover:bg-yellow-400 shadow-md transition-transform active:scale-95"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Nueva Sede
                            </button>
                        </div>

                        {tenant.locations && tenant.locations.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {tenant.locations.map(loc => (
                                    <div key={loc.id} className="bg-white dark:bg-gray-700/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 flex justify-between items-start hover:shadow-md transition-all">
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{loc.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {loc.address || 'Sin dirección'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${loc.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                                {loc.isActive ? 'Activa' : 'Inactiva'}
                                            </span>
                                            <div className="flex gap-1">
                                                {loc.isActive ? (
                                                    <button
                                                        onClick={() => handleDeleteLocation(loc.id)}
                                                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                                                        title="Desactivar Sede"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReactivateLocation(loc)}
                                                        className="text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/50 transition-colors"
                                                        title="Reactivar Sede"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">No hay sedes registradas para esta empresa.</p>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-display font-bold text-brand-blue dark:text-blue-300">Usuarios</h3>
                            <button
                                onClick={openCreateUserModal}
                                className="flex items-center px-4 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-800 shadow-md transition-transform active:scale-95"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Crear Usuario
                            </button>
                        </div>
                        {tenant.users.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay usuarios asignados</p>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2">
                                {tenant.users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500 dark:text-gray-300">
                                                {user.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{user.username}</p>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{user.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openEditUserModal(user)}
                                                className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                title="Editar Usuario"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => removeUserFromTenant(user.id)}
                                                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Remover acceso"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {
                showAddUserModal && (
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md transition-colors">
                            <h3 className="text-xl font-display font-bold text-brand-blue dark:text-blue-300 mb-4">
                                {editingUser ? 'Editar Usuario' : 'Crear y Asignar Usuario'}
                            </h3>
                            <form onSubmit={handleSubmitUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                        placeholder="admin.empresa"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Password {editingUser && '(Opcional)'}
                                    </label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required={!editingUser}
                                        placeholder={editingUser ? '••••••••' : ''}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    />
                                </div>
                                {(newUser.password || !editingUser) && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            Confirmar Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={newUser.confirmPassword}
                                            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                                            required={!editingUser || !!newUser.password}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Rol *
                                    </label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    >
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="LOCATION_MANAGER">LOCATION_MANAGER</option>
                                        <option value="OPERATOR">OPERATOR</option>
                                        <option value="CASHIER">CASHIER</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddUserModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-800"
                                    >
                                        {editingUser ? 'Actualizar' : 'Crear Usuario'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Add Location Modal */}
            {
                showAddLocationModal && (
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 transition-colors">
                            <h3 className="text-xl font-display font-bold text-brand-blue dark:text-blue-300 mb-4">Nueva Sede</h3>
                            <form onSubmit={createLocation} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nombre de la Sede</label>
                                    <input
                                        type="text"
                                        required
                                        value={newLocation.name}
                                        onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                        placeholder="Ej. Sede Norte"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                                    <input
                                        type="text"
                                        value={newLocation.address}
                                        onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                        placeholder="Ej. Calle 123 #45-67"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        value={newLocation.phone}
                                        onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                        placeholder="Ej. 300 123 4567"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddLocationModal(false)}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-brand-yellow dark:bg-yellow-500 text-brand-blue dark:text-gray-900 font-bold rounded-lg hover:bg-yellow-400 dark:hover:bg-yellow-400 shadow-md"
                                    >
                                        Crear Sede
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Change Plan Modal */}
            {
                showPlanModal && (
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 transition-colors">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-display font-bold text-brand-blue dark:text-blue-300">Cambiar Plan de Suscripción</h3>
                                <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 scale-110">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                {Object.entries(SAAS_PLANS).map(([key, plan]) => (
                                    <div
                                        key={key}
                                        className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all ${selectedPlan === key
                                            ? 'border-brand-blue dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-brand-blue dark:ring-blue-400 ring-opacity-20 transform scale-105 shadow-lg'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                                            }`}
                                        onClick={() => setSelectedPlan(key)}
                                    >
                                        {selectedPlan === key && (
                                            <div className="absolute top-3 right-3 text-brand-blue dark:text-blue-400">
                                                <CheckCircle className="h-6 w-6 fill-current" />
                                            </div>
                                        )}
                                        <h4 className="text-xl font-bold text-brand-blue dark:text-blue-300 mb-2 uppercase">{plan.label}</h4>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                            ${plan.price.toLocaleString()} <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">/mes</span>
                                        </p>
                                        <ul className="space-y-3 text-sm">
                                            <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                <MapPin className="h-4 w-4 text-brand-green dark:text-green-400 mr-2" />
                                                <span className="font-bold">{plan.maxLocations}</span> &nbsp; Sedes Máximas
                                            </li>
                                            <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                <Users className="h-4 w-4 text-brand-green dark:text-green-400 mr-2" />
                                                <span className="font-bold">{plan.maxUsers}</span> &nbsp; Usuarios Admin/Op
                                            </li>
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => setShowPlanModal(false)}
                                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdatePlan}
                                    className="px-6 py-2 bg-brand-yellow dark:bg-yellow-500 text-brand-blue dark:text-gray-900 font-bold rounded-lg hover:bg-yellow-400 dark:hover:bg-yellow-400 shadow-md transition-colors"
                                    disabled={selectedPlan === tenant.plan}
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
