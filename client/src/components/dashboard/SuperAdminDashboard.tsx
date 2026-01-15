import { Link } from 'react-router-dom';
import { Users, Building, MapPin, TrendingUp, Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Skeleton } from '../Skeleton';
import { useSuperAdminStats } from '../../hooks/useSuperAdminStats';
import { TenantsAtRisk } from './TenantsAtRisk';

export const SuperAdminDashboard = () => {
    const { stats, loading } = useSuperAdminStats();

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        );
    }

    if (!stats) return <div className="text-red-500">Error cargando estadísticas.</div>;

    const cards = [
        {
            title: 'Empresas Activas',
            value: stats.counts.tenants,
            icon: Building,
            color: 'bg-blue-500',
            textColor: 'text-blue-500'
        },
        {
            title: 'Sedes Operativas',
            value: stats.counts.locations,
            icon: MapPin,
            color: 'bg-green-500',
            textColor: 'text-green-500'
        },
        {
            title: 'Usuarios Activos',
            value: stats.counts.users,
            icon: Users,
            color: 'bg-indigo-500',
            textColor: 'text-indigo-500'
        },
        {
            title: 'Ingresos Mensuales (Global)',
            value: formatCurrency(stats.counts.revenue),
            icon: TrendingUp,
            color: 'bg-yellow-500',
            textColor: 'text-yellow-500'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Quick Actions / Alerts */}
            <div className="flex gap-4">
                <Link
                    to="/admin/errors"
                    className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-red-100 hover:border-red-300 transition-colors flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full text-red-600">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 group-hover:text-red-600 transition-colors">Reportes de Error</h3>
                            <p className="text-xs text-gray-500">Ver logs de frontend</p>
                        </div>
                    </div>
                    <ArrowRight size={20} className="text-gray-300 group-hover:text-red-500 transition-colors" />
                </Link>
                {/* Placeholder for more widgets */}
                <div className="flex-1 hidden md:block"></div>
                <div className="flex-1 hidden md:block"></div>
                <div className="flex-1 hidden md:block"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                        <div className={`p-4 rounded-full bg-opacity-10 ${card.color.replace('bg-', 'bg-opacity-10 bg-')} mr-4`}>
                            <card.icon className={card.textColor} size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                            <h3 className="text-2xl font-bold font-display text-gray-800">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Global Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-display font-bold text-gray-800 flex items-center">
                        <Activity className="mr-2 text-brand-blue" size={20} />
                        Actividad Reciente (Global)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Empresa / Sede</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Descripción</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.activity.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(t.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <div className="font-bold">{t.tenant}</div>
                                        <div className="text-xs text-gray-500">{t.location}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {t.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-brand-green">
                                        {formatCurrency(t.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tenants at Risk */}
            <TenantsAtRisk />
        </div>
    );
};
