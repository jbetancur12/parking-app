import { useEffect, useState } from 'react';
import { Users, Key, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import api from '../api/client';
import type { DashboardStats, License } from '../types/license';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function StatCard({ title, value, icon: Icon, subtext, color }: any) {
    return (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            {subtext && (
                <div className="mt-4 flex items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{subtext}</span>
                </div>
            )}
        </div>
    );
}

export function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentLicenses, setRecentLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, licensesRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/licenses')
                ]);
                setStats(statsRes.data);
                // Get only first 5 for recent activity
                setRecentLicenses(licensesRes.data.slice(0, 5));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard General</h1>
                <p className="text-gray-500 dark:text-gray-400">Resumen de actividad y licencias</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Licencias Activas"
                    value={stats?.activeLicenses || 0}
                    icon={Key}
                    subtext="Total activas actualmente"
                    color="bg-blue-600"
                />
                <StatCard
                    title="Ingresos Estimados"
                    value={`$${(stats?.estimatedRevenue || 0).toLocaleString()}`}
                    icon={TrendingUp}
                    subtext="Basado en licencias Full"
                    color="bg-green-600"
                />
                <StatCard
                    title="Licencias por Vencer"
                    value={stats?.expiringSoon || 0}
                    icon={AlertTriangle}
                    subtext="En los próximos 30 días"
                    color="bg-orange-500"
                />
                <StatCard
                    title="Total Clientes"
                    value={stats?.totalClients || 0}
                    icon={Users}
                    subtext="Registrados en el sistema"
                    color="bg-purple-600"
                />
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Últimas Activaciones</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Licencia</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3">Creada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {recentLicenses.map((license) => (
                                <tr key={license.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{license.customerName}</div>
                                        <div className="text-gray-500 text-xs">{license.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                                        {license.licenseKey}
                                    </td>
                                    <td className="px-6 py-4 capitalize">
                                        <span className={license.type === 'trial' ? 'text-orange-600' : 'text-blue-600'}>
                                            {license.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={license.status} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {formatDistanceToNow(new Date(license.createdAt), { addSuffix: true, locale: es })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        revoked: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    }[status] || "bg-gray-100 text-gray-800";

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles} capitalize`}>
            {status}
        </span>
    );
}
