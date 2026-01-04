import { useState, useEffect } from 'react';
import { Activity, Users, MapPin, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface UsageMetric {
    current: number;
    limit: number;
    softLimit: number;
    hardLimit: number;
    percentage: number;
    warningLevel?: 'soft' | 'critical' | 'blocked';
}

interface TenantUsage {
    sessions: UsageMetric;
    users: UsageMetric;
    locations: UsageMetric;
}

interface TenantUsageCardsProps {
    tenantId: string;
}

export function TenantUsageCards({ tenantId }: TenantUsageCardsProps) {
    const [usage, setUsage] = useState<TenantUsage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsage();
    }, [tenantId]);

    const loadUsage = async () => {
        try {
            setLoading(true);
            const response = await api.get(`${API_URL}/admin/billing/usage/tenants/${tenantId}`);
            setUsage(response.data);
        } catch (error) {
            console.error('Failed to load tenant usage:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse" />
                ))}
            </div>
        );
    }

    if (!usage) return null;

    const metrics = [
        {
            label: 'Sesiones de Parqueo',
            icon: Activity,
            data: usage.sessions,
            color: 'blue',
        },
        {
            label: 'Usuarios',
            icon: Users,
            data: usage.users,
            color: 'green',
        },
        {
            label: 'Sedes',
            icon: MapPin,
            data: usage.locations,
            color: 'purple',
        },
    ];

    const getStatusColor = (warningLevel?: string) => {
        if (warningLevel === 'blocked') return 'red';
        if (warningLevel === 'critical') return 'orange';
        if (warningLevel === 'soft') return 'yellow';
        return 'green';
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Uso del Plan</h3>

            <div className="grid md:grid-cols-3 gap-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    const statusColor = getStatusColor(metric.data.warningLevel);
                    const isUnlimited = metric.data.limit === Infinity;

                    return (
                        <div key={metric.label} className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-lg bg-${metric.color}-50`}>
                                    <Icon className={`text-${metric.color}-600`} size={20} />
                                </div>
                                {metric.data.warningLevel && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-${statusColor}-100 text-${statusColor}-800`}>
                                        {metric.data.warningLevel === 'blocked' && 'Bloqueado'}
                                        {metric.data.warningLevel === 'critical' && 'Crítico'}
                                        {metric.data.warningLevel === 'soft' && 'Advertencia'}
                                    </span>
                                )}
                            </div>

                            <h4 className="text-sm font-semibold text-gray-600 mb-2">
                                {metric.label}
                            </h4>

                            <div className="mb-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">
                                        {metric.data.current.toLocaleString()}
                                    </span>
                                    {!isUnlimited && (
                                        <span className="text-gray-500 text-sm">
                                            / {metric.data.limit.toLocaleString()}
                                        </span>
                                    )}
                                    {isUnlimited && (
                                        <span className="text-gray-500 text-sm">/ ∞</span>
                                    )}
                                </div>
                                {!isUnlimited && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        {metric.data.percentage.toFixed(1)}% utilizado
                                    </p>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {!isUnlimited && (
                                <div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                                        <div
                                            className={`h-full transition-all bg-${statusColor}-500`}
                                            style={{ width: `${Math.min(metric.data.percentage, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Soft: {metric.data.softLimit}</span>
                                        <span>Hard: {metric.data.hardLimit}</span>
                                    </div>
                                </div>
                            )}

                            {/* Warning Message */}
                            {metric.data.warningLevel && (
                                <div className={`mt-3 p-2 rounded-lg bg-${statusColor}-50 border border-${statusColor}-200`}>
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className={`text-${statusColor}-600 flex-shrink-0 mt-0.5`} size={14} />
                                        <p className={`text-xs text-${statusColor}-800`}>
                                            {metric.data.warningLevel === 'blocked' && 'Límite máximo alcanzado'}
                                            {metric.data.warningLevel === 'critical' && `En tolerancia hasta ${metric.data.hardLimit}`}
                                            {metric.data.warningLevel === 'soft' && 'Acercándose al límite'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
