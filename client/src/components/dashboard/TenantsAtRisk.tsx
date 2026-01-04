import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface TenantUsageOverview {
    id: string;
    name: string;
    plan: string;
    isActive: boolean;
    usage: {
        sessions: { current: number; limit: number; percentage: number; warningLevel?: string };
        users: { current: number; limit: number; percentage: number; warningLevel?: string };
        locations: { current: number; limit: number; percentage: number; warningLevel?: string };
    };
    hasWarnings: boolean;
    isBlocked: boolean;
    isCritical: boolean;
}

export function TenantsAtRisk() {
    const [tenants, setTenants] = useState<TenantUsageOverview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTenantsUsage();
    }, []);

    const loadTenantsUsage = async () => {
        try {
            setLoading(true);
            const response = await api.get(`${API_URL}/admin/billing/usage/tenants`);
            setTenants(response.data);
        } catch (error) {
            console.error('Failed to load tenants usage:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
                    Tenants en Riesgo
                </h2>
                <p className="text-gray-600">Cargando...</p>
            </div>
        );
    }

    const atRiskTenants = tenants.filter(t => t.hasWarnings || t.isBlocked);

    if (atRiskTenants.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
                    Tenants en Riesgo
                </h2>
                <p className="text-green-600">✅ Todos los tenants están dentro de sus límites</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-gray-900">
                    Tenants en Riesgo
                </h2>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                    {atRiskTenants.length} alertas
                </span>
            </div>

            <div className="space-y-3">
                {atRiskTenants.map((tenant) => {
                    const statusColor = tenant.isBlocked ? 'red' : tenant.isCritical ? 'orange' : 'yellow';
                    const statusText = tenant.isBlocked ? 'Bloqueado' : tenant.isCritical ? 'Crítico' : 'Advertencia';

                    // Find the most critical metric
                    const criticalMetric = [
                        { name: 'Sesiones', ...tenant.usage.sessions },
                        { name: 'Usuarios', ...tenant.usage.users },
                        { name: 'Sedes', ...tenant.usage.locations },
                    ].find(m => m.warningLevel === 'blocked' || m.warningLevel === 'critical') ||
                        [
                            { name: 'Sesiones', ...tenant.usage.sessions },
                            { name: 'Usuarios', ...tenant.usage.users },
                            { name: 'Sedes', ...tenant.usage.locations },
                        ].find(m => m.warningLevel === 'soft');

                    return (
                        <div
                            key={tenant.id}
                            className={`p-4 rounded-lg border-2 bg-${statusColor}-50 border-${statusColor}-200`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className={`text-${statusColor}-600 flex-shrink-0`} size={18} />
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {tenant.name}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold bg-${statusColor}-200 text-${statusColor}-900`}>
                                            {statusText}
                                        </span>
                                    </div>

                                    {criticalMetric && (
                                        <p className={`text-sm text-${statusColor}-800`}>
                                            <strong>{criticalMetric.name}:</strong> {criticalMetric.current}/{criticalMetric.limit === Infinity ? '∞' : criticalMetric.limit}
                                            {' '}({criticalMetric.percentage.toFixed(0)}%)
                                        </p>
                                    )}

                                    <p className="text-xs text-gray-600 mt-1">
                                        Plan: <span className="font-semibold">{tenant.plan}</span>
                                    </p>
                                </div>

                                <a
                                    href={`/admin/tenants/${tenant.id}`}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-brand-yellow text-gray-900 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-colors whitespace-nowrap"
                                >
                                    <TrendingUp size={14} />
                                    Ver Detalles
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
