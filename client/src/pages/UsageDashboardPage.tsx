import { useNavigate } from 'react-router-dom';
import { useUsageLimits } from '../hooks/useUsageLimits';
import { Users, MapPin, Activity, TrendingUp, AlertCircle } from 'lucide-react';

export default function UsageDashboardPage() {
    const { usage, loading, error } = useUsageLimits();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando uso...</p>
                </div>
            </div>
        );
    }

    if (error || !usage) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error || 'No se pudo cargar el uso'}</p>
                </div>
            </div>
        );
    }

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
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    Uso del Plan
                </h1>
                <p className="text-gray-600">
                    Monitorea tu uso mensual y límites del plan
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    const statusColor = getStatusColor(metric.data.warningLevel);
                    const isUnlimited = metric.data.limit === Infinity;

                    return (
                        <div key={metric.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-${metric.color}-50`}>
                                    <Icon className={`text-${metric.color}-600`} size={24} />
                                </div>
                                {metric.data.warningLevel && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${statusColor}-100 text-${statusColor}-800`}>
                                        {metric.data.warningLevel === 'blocked' && 'Bloqueado'}
                                        {metric.data.warningLevel === 'critical' && 'Crítico'}
                                        {metric.data.warningLevel === 'soft' && 'Advertencia'}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-sm font-semibold text-gray-600 mb-2">
                                {metric.label}
                            </h3>

                            <div className="mb-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {metric.data.current.toLocaleString()}
                                    </span>
                                    {!isUnlimited && (
                                        <span className="text-gray-500">
                                            / {metric.data.limit.toLocaleString()}
                                        </span>
                                    )}
                                    {isUnlimited && (
                                        <span className="text-gray-500">/ ∞</span>
                                    )}
                                </div>
                                {!isUnlimited && (
                                    <p className="text-sm text-gray-600 mt-1">
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
                                <div className={`mt-4 p-3 rounded-lg bg-${statusColor}-50 border border-${statusColor}-200`}>
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className={`text-${statusColor}-600 flex-shrink-0 mt-0.5`} size={16} />
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

            {/* Upgrade CTA */}
            <div className="bg-gradient-to-r from-brand-blue to-blue-700 rounded-lg p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-display font-bold mb-2">
                            ¿Necesitas más capacidad?
                        </h2>
                        <p className="text-blue-100">
                            Actualiza tu plan para obtener más sedes, usuarios y sesiones ilimitadas
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/billing')}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-yellow text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                    >
                        <TrendingUp size={20} />
                        Ver Planes
                    </button>
                </div>
            </div>
        </div>
    );
}
