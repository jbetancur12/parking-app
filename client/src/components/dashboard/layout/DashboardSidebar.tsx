import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, X, Building2, MapPin, Sun, Moon, LogOut, Trash } from 'lucide-react';
import type { NavGroup } from '../../../hooks/useDashboardLogic';
import { OfflineIndicator } from '../../OfflineIndicator';
import { useOffline } from '../../../context/OfflineContext';

interface DashboardSidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    filteredGroups: NavGroup[];
    openGroups: string[];
    toggleGroup: (groupTitle: string) => void;
    location: any;
    currentTenant: any;
    currentLocation: any;
    user: any;
    navigate: any;
    theme: string;
    toggleTheme: () => void;
    logout: () => void;
}

const ClearQueueButton = () => {
    const { queue, clearOfflineQueue } = useOffline();

    if (queue.length === 0) return null;

    return (
        <button
            onClick={() => {
                if (window.confirm(`¿Eliminar ${queue.length} acciones pendientes?`)) {
                    clearOfflineQueue();
                }
            }}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
            title="Limpiar cola offline"
        >
            <Trash size={12} />
        </button>
    );
};

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    filteredGroups,
    openGroups,
    toggleGroup,
    location,
    currentTenant,
    currentLocation,
    user,
    navigate,
    theme,
    toggleTheme,
    logout
}) => {
    return (
        <div className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-brand-blue shadow-lg transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
            {/* Header / Logo */}
            <div className="flex h-20 items-center justify-center px-6 border-b border-blue-800 flex-shrink-0">
                <img
                    src="/logo_cuadra.png"
                    alt="Cuadra"
                    className="h-16 w-auto"
                    style={{ filter: 'grayscale(1) invert(1) brightness(2) contrast(1.2)', mixBlendMode: 'screen' }}
                />
                {user?.role === 'SUPER_ADMIN' && (
                    <span className="absolute bottom-2 right-4 text-[10px] font-bold text-brand-yellow tracking-widest bg-brand-blue px-1 rounded">SAAS</span>
                )}
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute right-4 text-white">
                    <X size={24} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-3 space-y-2 flex-1 overflow-y-auto">
                {filteredGroups.map((group) => {
                    const isOpen = openGroups.includes(group.title);
                    return (
                        <div key={group.title} className="mb-2">
                            <button
                                onClick={() => toggleGroup(group.title)}
                                className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-blue-200 uppercase tracking-wider hover:text-white focus:outline-none"
                            >
                                <span>{group.title}</span>
                                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            {isOpen && (
                                <div className="space-y-1 mt-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = location.pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                                    ? 'bg-brand-yellow text-brand-blue shadow-md transform scale-[1.02]'
                                                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-brand-blue' : 'text-blue-300'}`} />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Context Footer */}
            <div className="w-full border-t border-blue-800 p-4 flex-shrink-0 bg-brand-blue">
                {/* Tenant Context Display */}
                {currentTenant && (
                    <div className="mb-2 px-4 py-2 bg-blue-900/50 rounded-lg border border-blue-700">
                        <div className="flex items-center text-xs mb-1">
                            <Building2 className="mr-2 h-4 w-4 text-brand-yellow" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{currentTenant.name}</p>
                            </div>
                        </div>

                        {/* Plan Badge */}
                        <div className="pl-6">
                            {(() => {
                                const plan = currentTenant.plan || 'free';
                                const status = currentTenant.planStatus;

                                let label = 'Gratis';
                                let colorClass = 'bg-gray-600 text-gray-200';

                                if (plan === 'trial') {
                                    label = 'Prueba';
                                    colorClass = 'bg-purple-600 text-white';
                                    if (currentTenant.trialEndsAt) {
                                        const end = new Date(currentTenant.trialEndsAt);
                                        const diff = Math.ceil((end.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                        if (diff > 0) label += ` (${diff}d)`;
                                        else label = 'Prueba Vencida';
                                    }
                                } else if (plan === 'basic') {
                                    label = 'Básico';
                                    colorClass = 'bg-blue-600 text-white';
                                } else if (plan === 'pro') {
                                    label = 'Pro';
                                    colorClass = 'bg-green-600 text-white';
                                } else if (plan === 'enterprise') {
                                    label = 'Enterprise';
                                    colorClass = 'bg-yellow-600 text-white';
                                }

                                if (status === 'past_due') {
                                    label += ' (Pagos Pendientes)';
                                    colorClass = 'bg-red-600 text-white';
                                }

                                return (
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${colorClass}`}>
                                        {label}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>

            {/* User & Settings Footer */}
            <div className="mt-auto border-t border-blue-800/30 bg-blue-900/20 p-3 space-y-2">
                {currentLocation && (
                    <div
                        className="flex items-center gap-2 text-xs text-blue-200 cursor-pointer hover:text-white transition-colors"
                        onClick={() => user?.locations && user.locations.length > 1 && navigate('/select-location')}
                        title="Cambiar Sede"
                    >
                        <MapPin size={12} className="text-brand-green shrink-0" />
                        <span className="font-semibold truncate flex-1">{currentLocation.name}</span>
                        {user?.locations && user.locations.length > 1 && <ChevronRight size={10} />}
                    </div>
                )}

                <div className="flex items-center justify-between gap-2">
                    <div
                        className="min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate('/profile')}
                        title="Ver Perfil"
                    >
                        <p className="text-xs font-bold text-white truncate">{user?.username}</p>
                        <p className="text-[10px] text-blue-300 truncate">
                            {user?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                                user?.role === 'ADMIN' ? 'Admin' :
                                    user?.role === 'LOCATION_MANAGER' ? 'Admin Sede' : 'Operador'}
                        </p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-1.5 text-blue-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <button
                        onClick={logout}
                        className="p-1.5 text-red-300 hover:text-red-100 hover:bg-red-900/30 rounded-md transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-800/30">
                    <div className="text-[9px] text-blue-500/50 select-none">v0.0.5</div>
                    <div className="hidden lg:flex items-center">
                        <OfflineIndicator variant="minimal" />
                        <ClearQueueButton />
                    </div>
                </div>
            </div>
        </div>
    );
};
