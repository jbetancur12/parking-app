import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Edit, Power, PowerOff, MapPin, Users } from 'lucide-react';
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
    locationsCount: number;
    usersCount: number;
}

export default function TenantsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');

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

    const getStatusBadge = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            suspended: 'bg-red-100 text-red-800',
            archived: 'bg-gray-100 text-gray-800',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors] || colors.archived}`}>
                {status}
            </span>
        );
    };

    const getPlanBadge = (plan: string) => {
        const colors = {
            free: 'bg-blue-100 text-blue-800',
            pro: 'bg-purple-100 text-purple-800',
            enterprise: 'bg-yellow-100 text-yellow-800',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[plan as keyof typeof colors] || colors.free}`}>
                {plan.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Empresas</h1>
                    <p className="text-sm text-gray-600 mt-1">Administrar tenants del sistema</p>
                </div>
                <Link
                    to="/admin/tenants/new"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Nueva Empresa
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['all', 'active', 'suspended'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as typeof filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {f === 'all' ? 'Todas' : f === 'active' ? 'Activas' : 'Suspendidas'}
                    </button>
                ))}
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Cargando...</div>
                ) : tenants.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No hay empresas registradas</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Empresa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Plan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sedes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuarios
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <Link
                                                to={`/admin/tenants/${tenant.id}`}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                                            >
                                                {tenant.name}
                                            </Link>
                                            <div className="text-sm text-gray-500">@{tenant.slug}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getPlanBadge(tenant.plan)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(tenant.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                                            {tenant.locationsCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Users className="mr-1 h-4 w-4 text-gray-400" />
                                            {tenant.usersCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/tenants/${tenant.id}/edit`}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => toggleTenantStatus(tenant.id, tenant.status)}
                                                className={`${tenant.status === 'active'
                                                    ? 'text-red-600 hover:text-red-900'
                                                    : 'text-green-600 hover:text-green-900'
                                                    }`}
                                            >
                                                {tenant.status === 'active' ? (
                                                    <PowerOff className="h-4 w-4" />
                                                ) : (
                                                    <Power className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
