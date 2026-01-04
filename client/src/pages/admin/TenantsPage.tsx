import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Edit, Power, PowerOff, MapPin, Users, Info } from 'lucide-react';
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

const SAAS_PLANS: Record<string, { maxLocations: number; maxUsers: number; price: number; label: string }> = {
    basic: { maxLocations: 1, maxUsers: 2, price: 50000, label: 'Básico' },
    pro: { maxLocations: 5, maxUsers: 10, price: 150000, label: 'Pro' },
    enterprise: { maxLocations: 100, maxUsers: 1000, price: 300000, label: 'Enterprise' }
};

export default function TenantsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');
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

    const getStatusBadge = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
        return (
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors[status as keyof typeof colors] || colors.archived}`}>
                {status}
            </span>
        );
    };

    const getPlanBadge = (plan: string) => {
        const colors = {
            basic: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            pro: 'bg-brand-blue/10 text-brand-blue dark:bg-blue-900/30 dark:text-blue-300',
            enterprise: 'bg-brand-yellow/20 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        };
        return (
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors[plan as keyof typeof colors] || colors.basic}`}>
                {plan.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-brand-blue dark:text-white">Gestión de Empresas</h1>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">Administrar tenants del sistema</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowPlansModal(true)}
                        className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
                    >
                        <Info className="mr-2 h-5 w-5" />
                        Ver Planes
                    </button>
                    <Link
                        to="/admin/tenants/new"
                        className="flex items-center px-4 py-2 bg-brand-yellow dark:bg-yellow-500 text-brand-blue dark:text-gray-900 font-bold rounded-lg hover:bg-yellow-400 dark:hover:bg-yellow-400 shadow-md transition-transform active:scale-95"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Nueva Empresa
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'all'
                        ? 'bg-brand-blue dark:bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    Todas
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'active'
                        ? 'bg-brand-blue dark:bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    Activas
                </button>
                <button
                    onClick={() => setFilter('suspended')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'suspended'
                        ? 'bg-brand-blue dark:bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    Suspendidas
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-brand-blue/5 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Uso</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Creada</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Cargando empresas...
                                    </td>
                                </tr>
                            ) : tenants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No se encontraron empresas
                                    </td>
                                </tr>
                            ) : (
                                tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-brand-blue/10 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-brand-blue dark:text-blue-300 font-bold">
                                                    {tenant.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{tenant.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">@{tenant.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getPlanBadge(tenant.plan)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(tenant.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-300 space-y-1">
                                                <div className="flex items-center gap-1" title="Sedes">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span>{tenant.locationsCount}</span>
                                                </div>
                                                <div className="flex items-center gap-1" title="Usuarios">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    <span>{tenant.usersCount}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(tenant.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                                                    className="text-brand-blue dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                    title="Ver Detalle"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleTenantStatus(tenant.id, tenant.status)}
                                                    className={`p-2 rounded-lg transition-colors ${tenant.status === 'active'
                                                        ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50'
                                                        : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50'
                                                        }`}
                                                    title={tenant.status === 'active' ? 'Suspender' : 'Activar'}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Plans Modal */}
            {showPlansModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-display font-bold text-brand-blue dark:text-blue-300">Estructura de Planes SaaS</h2>
                            <button
                                onClick={() => setShowPlansModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-bold"
                            >
                                X
                            </button>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {Object.entries(SAAS_PLANS).map(([key, plan]) => (
                                <div key={key} className={`border rounded-xl p-6 transition-colors ${key === 'pro' ? 'border-brand-blue dark:border-blue-500 ring-1 ring-brand-blue dark:ring-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-600'}`}>
                                    <h3 className="text-xl font-bold text-brand-blue dark:text-blue-300 mb-2 uppercase">{plan.label}</h3>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                        ${plan.price.toLocaleString()} <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">/mes</span>
                                    </p>
                                    <ul className="space-y-3">
                                        <li className="flex items-center text-gray-700 dark:text-gray-300">
                                            <MapPin className="h-5 w-5 text-brand-green dark:text-green-400 mr-2" />
                                            <span className="font-bold">{plan.maxLocations}</span> &nbsp; Sedes Máximas
                                        </li>
                                        <li className="flex items-center text-gray-700 dark:text-gray-300">
                                            <Users className="h-5 w-5 text-brand-green dark:text-green-400 mr-2" />
                                            <span className="font-bold">{plan.maxUsers}</span> &nbsp; Usuarios Admin/Op
                                        </li>
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setShowPlansModal(false)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
