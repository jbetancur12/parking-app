import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ArrowLeft, Building2, MapPin, Users, Edit, Trash2, Plus, UserPlus, CheckCircle, X, Power } from 'lucide-react';
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
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'OPERATOR' });

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

    const createAndAssignUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 1. Create user
            const createResponse = await api.post('/users', { ...newUser, tenantId: id });
            const createdUserId = createResponse.data.id;

            // 2. Assign to tenant
            await api.post(`/admin/users/${createdUserId}/tenants`, {
                tenantIds: [id]
            });

            toast.success('Usuario creado y asignado');
            setShowAddUserModal(false);
            setNewUser({ username: '', password: '', role: 'OPERATOR' });
            fetchTenantDetails();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Error al crear usuario';
            toast.error(message);
        }
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

    const toggleLocationStatus = async (locationId: string, currentStatus: boolean, locationName: string) => {
        if (!confirm(`¿${currentStatus ? 'Desactivar' : 'Activar'} la sede "${locationName}"?`)) return;

        try {
            await api.put(`/admin/locations/${locationId}`, { isActive: !currentStatus });
            toast.success(`Sede ${currentStatus ? 'desactivada' : 'activada'} exitosamente`);
            fetchTenantDetails();
        } catch (error) {
            console.error('Error toggling location:', error);
            toast.error('Error al cambiar estado de la sede');
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
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-brand-blue">{tenant.name}</h1>
                        <p className="text-sm font-medium text-gray-500">@{tenant.slug}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/admin/tenants/${id}/edit`)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Empresa
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-brand-blue text-brand-blue font-bold'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {activeTab === 'info' && (
                    <dl className="grid grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-bold text-gray-500 mb-1">Plan Actual</dt>
                            <dd className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase
                                    ${tenant.plan === 'enterprise' ? 'bg-yellow-100 text-yellow-800' :
                                        tenant.plan === 'pro' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'}`}>
                                    {tenant.plan}
                                </span>
                                <button
                                    onClick={openPlanModal}
                                    className="text-xs text-brand-blue hover:text-blue-800 underline font-semibold"
                                >
                                    Cambiar Plan
                                </button>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-bold text-gray-500 mb-1">Estado</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-medium">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full
                                    ${tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {tenant.status}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-bold text-gray-500 mb-1">Email de Contacto</dt>
                            <dd className="mt-1 text-sm text-gray-900">{tenant.contactEmail || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-bold text-gray-500 mb-1">Fecha de Creación</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {new Date(tenant.createdAt).toLocaleDateString()}
                            </dd>
                        </div>
                    </dl>
                )}

                {activeTab === 'locations' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-display font-bold text-brand-blue">Sedes</h3>
                            <button
                                onClick={() => setShowAddLocationModal(true)}
                                className="flex items-center px-4 py-2 bg-brand-yellow text-brand-blue font-bold rounded-lg hover:bg-yellow-400 shadow-md transition-transform active:scale-95"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Nueva Sede
                            </button>
                        </div>

                        {/* Location List */}
                        {tenant.locations && tenant.locations.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {tenant.locations.map(loc => (
                                    <div key={loc.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-shadow">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-900">{loc.name}</h4>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${loc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {loc.isActive ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {loc.address || 'Sin dirección'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleLocationStatus(loc.id, loc.isActive, loc.name)}
                                            className={`p-2 rounded-lg transition-colors ${loc.isActive
                                                ? 'text-red-500 hover:bg-red-50'
                                                : 'text-green-500 hover:bg-green-50'
                                                }`}
                                            title={loc.isActive ? "Desactivar Sede" : "Activar Sede"}
                                        >
                                            <Power size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No hay sedes registradas para esta empresa.</p>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-display font-bold text-brand-blue">Usuarios</h3>
                            <button
                                onClick={() => setShowAddUserModal(true)}
                                className="flex items-center px-4 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-800 shadow-md transition-transform active:scale-95"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Crear Usuario
                            </button>
                        </div>
                        {tenant.users.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No hay usuarios asignados</p>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2">
                                {tenant.users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                                                {user.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{user.username}</p>
                                                <p className="text-xs font-medium text-gray-500 uppercase">{user.role}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeUserFromTenant(user.id)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remover acceso"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
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
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-display font-bold text-brand-blue mb-4">Crear y Asignar Usuario</h3>
                            <form onSubmit={createAndAssignUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                        placeholder="admin.empresa"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Rol *
                                    </label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    >
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="OPERATOR">OPERATOR</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddUserModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-800"
                                    >
                                        Crear Usuario
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Add Location Modal */}
            {showAddLocationModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
                        <h3 className="text-xl font-display font-bold text-brand-blue mb-4">Nueva Sede</h3>
                        <form onSubmit={createLocation} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Sede</label>
                                <input
                                    type="text"
                                    required
                                    value={newLocation.name}
                                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                    placeholder="Ej. Sede Norte"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Dirección</label>
                                <input
                                    type="text"
                                    value={newLocation.address}
                                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                    placeholder="Ej. Calle 123 #45-67"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    value={newLocation.phone}
                                    onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                    placeholder="Ej. 300 123 4567"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddLocationModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-brand-yellow text-brand-blue font-bold rounded-lg hover:bg-yellow-400 shadow-md"
                                >
                                    Crear Sede
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Plan Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-display font-bold text-brand-blue">Cambiar Plan de Suscripción</h3>
                            <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {Object.entries(SAAS_PLANS).map(([key, plan]) => (
                                <div
                                    key={key}
                                    className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all ${selectedPlan === key
                                        ? 'border-brand-blue bg-blue-50 ring-2 ring-brand-blue ring-opacity-20 transform scale-105 shadow-lg'
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                    onClick={() => setSelectedPlan(key)}
                                >
                                    {selectedPlan === key && (
                                        <div className="absolute top-3 right-3 text-brand-blue">
                                            <CheckCircle className="h-6 w-6 fill-current" />
                                        </div>
                                    )}
                                    <h4 className="text-xl font-bold text-brand-blue mb-2 uppercase">{plan.label}</h4>
                                    <p className="text-3xl font-bold text-gray-900 mb-4">
                                        ${plan.price.toLocaleString()} <span className="text-sm text-gray-500 font-normal">/mes</span>
                                    </p>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-center text-gray-700">
                                            <MapPin className="h-4 w-4 text-brand-green mr-2" />
                                            <span className="font-bold">{plan.maxLocations}</span> &nbsp; Sedes Máximas
                                        </li>
                                        <li className="flex items-center text-gray-700">
                                            <Users className="h-4 w-4 text-brand-green mr-2" />
                                            <span className="font-bold">{plan.maxUsers}</span> &nbsp; Usuarios Admin/Op
                                        </li>
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowPlanModal(false)}
                                className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdatePlan}
                                className="px-6 py-2 bg-brand-yellow text-brand-blue font-bold rounded-lg hover:bg-yellow-400 shadow-md"
                                disabled={selectedPlan === tenant.plan}
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
