import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ArrowLeft, Building2, MapPin, Users, Edit, Trash2, Plus, UserPlus } from 'lucide-react';
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
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                                ? 'border-blue-600 text-blue-600'
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
            <div className="bg-white rounded-lg shadow p-6">
                {activeTab === 'info' && (
                    <dl className="grid grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Plan</dt>
                            <dd className="mt-1 text-sm text-gray-900">{tenant.plan.toUpperCase()}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Estado</dt>
                            <dd className="mt-1 text-sm text-gray-900">{tenant.status}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email de Contacto</dt>
                            <dd className="mt-1 text-sm text-gray-900">{tenant.contactEmail || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
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
                                    <div key={loc.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{loc.name}</h4>
                                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {loc.address || 'Sin dirección'}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${loc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {loc.isActive ? 'Activa' : 'Inactiva'}
                                        </span>
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
                            <h3 className="text-lg font-semibold">Usuarios con Acceso</h3>
                            <button
                                onClick={() => setShowAddUserModal(true)}
                                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Crear Usuario
                            </button>
                        </div>
                        {tenant.users.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No hay usuarios asignados</p>
                        ) : (
                            <div className="space-y-2">
                                {tenant.users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{user.username}</p>
                                            <p className="text-sm text-gray-500">{user.role}</p>
                                        </div>
                                        <button
                                            onClick={() => removeUserFromTenant(user.id)}
                                            className="text-red-600 hover:text-red-900"
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Crear y Asignar Usuario</h3>
                            <form onSubmit={createAndAssignUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="admin.empresa"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rol *
                                    </label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="OPERATOR">OPERATOR</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Crear Usuario
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddUserModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Add Location Modal */}
            {showAddLocationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 m-4">
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
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
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
        </div >
    );
}
