
import { TrendingUp, Check, AlertTriangle } from 'lucide-react';
import { useUsageLimits } from '../../hooks/useUsageLimits';
import { Skeleton } from '../Skeleton';

export const PlanUsageTab = () => {
    const { usage, loading } = useUsageLimits();

    if (loading) return <Skeleton className="h-64 w-full" />;
    if (!usage) return null;

    const sections: { key: 'locations' | 'users' | 'sessions'; label: string; icon: string }[] = [
        { key: 'locations', label: 'Sedes', icon: '🏢' },
        { key: 'users', label: 'Usuarios', icon: '👥' },
        { key: 'sessions', label: 'Sesiones Activas', icon: '🔐' },
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="mr-2 text-brand-blue" />
                    Tu Plan y Uso
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sections.map((section) => {
                        const data = usage[section.key];
                        // Safety check in case API returns partial data
                        if (!data) return null;

                        const percentage = Math.min((data.current / data.limit) * 100, 100);
                        const isCritical = data.warningLevel === 'critical' || data.warningLevel === 'blocked';

                        return (
                            <div key={section.key} className={`p-4 rounded-lg border ${isCritical ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900' : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-2xl">{section.icon}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCritical ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {data.current} / {data.limit === 999999 ? '∞' : data.limit}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{section.label}</h3>

                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${isCritical ? 'bg-red-500' : 'bg-brand-blue'}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {data.limit === 999999 ? 'Ilimitado' : `${(data.limit - data.current)} restantes`}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h3 className="font-bold text-brand-blue dark:text-blue-300 mb-2 flex items-center">
                        <Check className="mr-2" size={18} />
                        Estado de tu Suscripción
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Actualmente tienes un plan <strong>{usage.planName || 'Básico'}</strong>.
                        Este plan se renueva automáticamente el próximo mes.
                        Si necesitas más capacidad, puedes actualizar tu plan en cualquier momento.
                    </p>
                    <button className="mt-4 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors shadow-sm">
                        Gestionar Suscripción
                    </button>
                    {usage.locations.warningLevel === 'blocked' && (
                        <div className="mt-4 flex items-center text-red-600 dark:text-red-400 text-sm font-bold bg-white dark:bg-gray-800 p-3 rounded border border-red-200 dark:border-red-900">
                            <AlertTriangle className="mr-2" size={18} />
                            Has alcanzado el límite de sedes. Actualiza tu plan para crear más.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
