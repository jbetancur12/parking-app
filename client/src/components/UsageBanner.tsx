import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, X } from 'lucide-react';
import type { UsageLimits } from '../services/usage.service';

interface UsageBannerProps {
    usage: UsageLimits;
    onDismiss?: () => void;
}

export function UsageBanner({ usage, onDismiss }: UsageBannerProps) {
    const navigate = useNavigate();

    // Determine the most critical warning
    const warnings = [
        { type: 'sessions', data: usage.sessions, label: 'sesiones' },
        // { type: 'users', data: usage.users, label: 'usuarios' },
        // { type: 'locations', data: usage.locations, label: 'sedes' },
    ].filter(w => w.data.warningLevel && w.type === 'sessions' && w.data.percentage >= 90);

    if (warnings.length === 0) return null;

    // Get the most critical warning
    const critical = warnings.find(w => w.data.warningLevel === 'blocked' || w.data.warningLevel === 'critical');
    const mainWarning = critical || warnings[0];

    const isBlocked = mainWarning.data.warningLevel === 'blocked';
    const isCritical = mainWarning.data.warningLevel === 'critical';

    const bgColor = isBlocked ? 'bg-red-50' : isCritical ? 'bg-orange-50' : 'bg-yellow-50';
    const borderColor = isBlocked ? 'border-red-200' : isCritical ? 'border-orange-200' : 'border-yellow-200';
    const textColor = isBlocked ? 'text-red-900' : isCritical ? 'text-orange-900' : 'text-yellow-900';
    const iconColor = isBlocked ? 'text-red-600' : isCritical ? 'text-orange-600' : 'text-yellow-600';

    return (
        <div className={`${bgColor} border ${borderColor} rounded-lg p-4 mb-6`}>
            <div className="flex items-start gap-3">
                <AlertTriangle className={`${iconColor} flex-shrink-0 mt-0.5`} size={20} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className={`font-semibold ${textColor} mb-1`}>
                                {isBlocked && '🚫 Servicio Bloqueado'}
                                {isCritical && !isBlocked && '⚠️ Límite Excedido'}
                                {!isCritical && !isBlocked && '⚠️ Acercándose al Límite'}
                            </h3>
                            <p className={`text-sm ${textColor}`}>
                                {isBlocked && (
                                    <>Has alcanzado el límite máximo de <strong>{mainWarning.label}</strong> ({mainWarning.data.current}/{mainWarning.data.hardLimit}).
                                        Actualiza tu plan para continuar.</>
                                )}
                                {isCritical && !isBlocked && (
                                    <>Has excedido tu límite de <strong>{mainWarning.label}</strong> ({mainWarning.data.current}/{mainWarning.data.limit}).
                                        Estás en tolerancia hasta {mainWarning.data.hardLimit}.</>
                                )}
                                {!isCritical && !isBlocked && (
                                    <>Estás cerca de tu límite de <strong>{mainWarning.label}</strong> ({mainWarning.data.current}/{mainWarning.data.limit}).</>
                                )}
                            </p>

                            {/* Progress Bar */}
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className={textColor}>Uso actual</span>
                                    <span className={`font-semibold ${textColor}`}>
                                        {mainWarning.data.percentage.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${isBlocked ? 'bg-red-600' :
                                            isCritical ? 'bg-orange-500' :
                                                'bg-yellow-500'
                                            }`}
                                        style={{ width: `${Math.min(mainWarning.data.percentage, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/billing')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${isBlocked || isCritical
                                    ? 'bg-brand-yellow text-gray-900 hover:bg-yellow-400'
                                    : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
                                    }`}
                            >
                                <TrendingUp size={16} />
                                Actualizar Plan
                            </button>
                            {onDismiss && !isBlocked && (
                                <button
                                    onClick={onDismiss}
                                    className={`p-2 rounded-lg hover:bg-white/50 transition-colors ${textColor}`}
                                    title="Cerrar"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Additional warnings */}
                    {warnings.length > 1 && (
                        <div className="mt-3 pt-3 border-t border-current/20">
                            <p className={`text-xs ${textColor} font-semibold mb-1`}>
                                También tienes advertencias en:
                            </p>
                            <ul className={`text-xs ${textColor} space-y-1`}>
                                {warnings.slice(1, 3).map((w, i) => (
                                    <li key={i}>
                                        • {w.label}: {w.data.current}/{w.data.limit} ({w.data.percentage.toFixed(0)}%)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
