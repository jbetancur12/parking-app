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
    free: { maxLocations: 1, maxUsers: 2, price: 0, label: 'Gratis' },
    pro: { maxLocations: 5, maxUsers: 10, price: 50000, label: 'Pro' },
    enterprise: { maxLocations: 100, maxUsers: 1000, price: 200000, label: 'Enterprise' }
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
            active: 'bg-green-100 text-green-800',
            suspended: 'bg-red-100 text-red-800',
            archived: 'bg-gray-100 text-gray-800',
        };
        return (
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors[status as keyof typeof colors] || colors.archived}`}>
                {status}
            </span>
        );
    };

    const getPlanBadge = (plan: string) => {
        const colors = {
            free: 'bg-gray-100 text-gray-800',
            pro: 'bg-brand-blue/10 text-brand-blue',
            enterprise: 'bg-brand-yellow/20 text-yellow-800',
        };
        return (
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors[plan as keyof typeof colors] || colors.free}`}>
                {plan.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-brand-blue">Gestión de Empresas</h1>
                    <p className="text-sm font-medium text-gray-600 mt-1">Administrar tenants del sistema</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowPlansModal(true)}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 shadow-sm"
                    >
                        <Info className="mr-2 h-5 w-5" />
                        Ver Planes
                    </button>
                    <Link
                        to="/admin/tenants/new"
                        className="flex items-center px-4 py-2 bg-brand-yellow text-brand-blue font-bold rounded-lg hover:bg-yellow-400 shadow-md transition-transform active:scale-95"
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
                        ? 'bg-brand-blue text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Todas
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'active'
                        ? 'bg-brand-blue text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Activas
                </button>
                <button
                    onClick={() => setFilter('suspended')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'suspended'
                        ? 'bg-brand-blue text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Suspendidas
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-brand-blue/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Uso</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Creada</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Cargando empresas...
                                    </td>
                                </tr>
                            ) : tenants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron empresas
                                    </td>
                                </tr>
                            ) : (
                                tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue font-bold">
                                                    {tenant.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{tenant.name}</div>
                                                    <div className="text-sm text-gray-500">@{tenant.slug}</div>
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
                                            <div className="text-sm text-gray-900 space-y-1">
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(tenant.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                                                    className="text-brand-blue hover:text-blue-900 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                                                    title="Ver Detalle"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleTenantStatus(tenant.id, tenant.status)}
                                                    className={`p-2 rounded-lg transition-colors ${tenant.status === 'active'
                                                        ? 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100'
                                                        : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-display font-bold text-brand-blue">Estructura de Planes SaaS</h2>
                            <button
                                onClick={() => setShowPlansModal(false)}
                                className="text-gray-500 hover:text-gray-700 font-bold"
                            >
                                X
                            </button>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {Object.entries(SAAS_PLANS).map(([key, plan]) => (
                                <div key={key} className={`border rounded-xl p-6 ${key === 'pro' ? 'border-brand-blue ring-1 ring-brand-blue bg-blue-50/30' : 'border-gray-200'}`}>
                                    <h3 className="text-xl font-bold text-brand-blue mb-2 uppercase">{plan.label}</h3>
                                    <p className="text-3xl font-bold text-gray-900 mb-4">
                                        ${plan.price.toLocaleString()} <span className="text-sm text-gray-500 font-normal">/mes</span>
                                    </p>
                                    <ul className="space-y-3">
                                        <li className="flex items-center text-gray-700">
                                            <MapPin className="h-5 w-5 text-brand-green mr-2" />
                                            <span className="font-bold">{plan.maxLocations}</span> &nbsp; Sedes Máximas
                                        </li>
                                        <li className="flex items-center text-gray-700">
                                            <Users className="h-5 w-5 text-brand-green mr-2" />
                                            <span className="font-bold">{plan.maxUsers}</span> &nbsp; Usuarios Admin/Op
                                        </li>
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setShowPlansModal(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
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
