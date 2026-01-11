
import { useLocation, useNavigate } from 'react-router-dom';
import { useUsageLimits } from '../../hooks/useUsageLimits';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react';

export const GlobalUsageAlert = () => {
    const { user } = useAuth();
    const { usage, hasWarnings } = useUsageLimits();
    const location = useLocation();
    const navigate = useNavigate();

    // Hide for Super Admin
    if (user?.role === 'SUPER_ADMIN') {
        return null;
    }

    // Hide if on dashboard (since it has the detailed widget)
    // Also hide if no warnings
    if (!hasWarnings || !usage || location.pathname === '/dashboard') {
        return null;
    }

    // Determine the most critical warning manually
    // User Requirement: 
    // 1. ONLY show for Sessions (consumption)
    // 2. ONLY show if usage is >= 90%
    const warnings = [
        { type: 'sessions', data: usage.sessions, label: 'sesiones' },
        // { type: 'users', data: usage.users, label: 'usuarios' },
        // { type: 'locations', data: usage.locations, label: 'sedes' },
    ].filter(w => w.data.warningLevel && w.type === 'sessions' && w.data.percentage >= 90);

    if (warnings.length === 0) return null;

    const critical = warnings.find(w => w.data.warningLevel === 'blocked' || w.data.warningLevel === 'critical');
    const mainWarning = critical || warnings[0];

    const isBlocked = mainWarning.data.warningLevel === 'blocked';
    const isCritical = mainWarning.data.warningLevel === 'critical';

    // Styling
    const bgColor = isBlocked ? 'bg-red-600' : isCritical ? 'bg-orange-500' : 'bg-yellow-500';
    const textColor = 'text-white';

    return (
        <div className={`${bgColor} ${textColor} px-4 py-2 shadow-md transition-colors duration-300 relative z-40`}>
            <div className="container mx-auto flex items-center justify-between gap-4 max-w-7xl">
                <div className="flex items-center gap-3 text-sm font-medium flex-1 overflow-hidden">
                    {isBlocked ? <AlertCircle className="shrink-0 animate-pulse" size={18} /> : <AlertTriangle className="shrink-0" size={18} />}

                    <span className="truncate">
                        {isBlocked
                            ? `SERVICIO BLOQUEADO: Has alcanzado el límite de ${mainWarning.label} (${mainWarning.data.current}/${mainWarning.data.hardLimit}).`
                            : `Atención: Estás al ${mainWarning.data.percentage.toFixed(0)}% de tu límite de ${mainWarning.label}.`
                        }
                    </span>
                </div>

                <div className="shrink-0">
                    <button
                        onClick={() => navigate('/billing')}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-bold transition-colors border border-white/40"
                    >
                        <TrendingUp size={14} />
                        Actualizar Plan
                    </button>
                </div>
            </div>
        </div>
    );
};
