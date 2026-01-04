import React from 'react';
import { Edit, Power, PowerOff, MapPin, Users } from 'lucide-react';
import type { Tenant } from '../../../hooks/useTenantsPage';

interface TenantListProps {
    tenants: Tenant[];
    loading: boolean;
    toggleTenantStatus: (id: string, currentStatus: string) => void;
    navigate: (path: string) => void;
}

export const TenantList: React.FC<TenantListProps> = ({
    tenants,
    loading,
    toggleTenantStatus,
    navigate
}) => {
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
    );
};
