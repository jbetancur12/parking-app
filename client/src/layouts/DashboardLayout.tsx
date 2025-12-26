import { useAuth } from '../context/AuthContext';
import { useSaas } from '../context/SaasContext';
import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, LogOut, FileText, Settings, Menu, X, Users, Tag, TrendingDown, DollarSign, Droplets, UserCog, History, Receipt, Shield, Briefcase, ChevronDown, ChevronRight, Building2, MapPin, Rocket, Package, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { OfflineIndicator } from '../components/OfflineIndicator';
import TenantSelector from '../components/TenantSelector';

type NavItem = {
    name: string;
    href: string;
    icon: any;
    roles?: string[]; // If undefined, accessible by all. If defined, only by those roles.
};

type NavGroup = {
    title: string;
    items: NavItem[];
};

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const { currentTenant, currentLocation, availableTenants } = useSaas(); // Destructure currentLocation
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openGroups, setOpenGroups] = useState<string[]>(
        user?.role === 'SUPER_ADMIN' ? ['SaaS Management'] : ['Operación', 'Finanzas']
    );
    const location = useLocation();
    const navigate = useNavigate();

    // Force selection if user has multiple locations but none selected
    useEffect(() => {
        if (user?.locations && user.locations.length > 1 && !currentTenant && !location.pathname.includes('select-location')) {
            // Actually check SaasContext for currentLocation. 
            // We need to access currentLocation from hook to check it properly
            // But wait, we have `currentTenant` from hook above, `availableTenants`. 
            // We need `currentLocation` from useSaas.
        }
    }, [user, navigate]);

    // Show tenant selector if user has multiple tenants and none selected
    const showTenantSelector = availableTenants.length > 1 && !currentTenant;

    // Redirect to location selection if needed
    useEffect(() => {
        if (user?.locations && user.locations.length > 1 && !currentLocation) {
            navigate('/select-location');
        }
    }, [user, currentLocation, navigate]);

    // STRICT CHECK: Validate license on every dashboard load
    // This prevents users with saved sessions from bypassing revocation
    useEffect(() => {
        // Only checking in Electron mode
        const isElectron = import.meta.env.VITE_APP_MODE === 'electron';
        if (!isElectron) return;

        const verifyAccess = async () => {
            try {
                const result = await (window as any).electronAPI?.validateLicense();
                if (!result || !result.isValid) {
                    console.warn('License invalid during session - forcing logout/activation');
                    // Optional: logout(); // If you want to clear session too
                    navigate('/license');
                }
            } catch (error) {
                console.error('Security check failed:', error);
            }
        };

        verifyAccess();
    }, [navigate]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const toggleGroup = (groupTitle: string) => {
        setOpenGroups(prev =>
            prev.includes(groupTitle)
                ? prev.filter(g => g !== groupTitle)
                : [...prev, groupTitle]
        );
    };

    // Navigation for Tenant/Operation Users (ADMIN, USER)
    const tenantNavigationGroups: NavGroup[] = [
        {
            title: 'Operación',
            items: [
                { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
                { name: 'Parqueo', href: '/parking', icon: Car },
                { name: 'Lavadero', href: '/wash', icon: Droplets },
                { name: 'Inventario', href: '/inventory', icon: Package, roles: ['ADMIN'] }, // Removed SUPER_ADMIN
                { name: 'Mensualidades', href: '/monthly', icon: Users },
            ]
        },
        {
            title: 'Finanzas',
            items: [
                { name: 'Egresos', href: '/expenses', icon: TrendingDown },
                { name: 'Ingresos', href: '/incomes', icon: DollarSign },
                { name: 'Transacciones', href: '/transactions', icon: Receipt, roles: ['ADMIN'] }, // Removed SUPER_ADMIN
                { name: 'Historial Turnos', href: '/shifts', icon: History, roles: ['ADMIN'] }, // Removed SUPER_ADMIN
                { name: 'Reportes', href: '/reports', icon: FileText, roles: ['ADMIN'] }, // Removed SUPER_ADMIN
            ]
        },
        {
            title: 'Administración',
            items: [
                { name: 'Convenios', href: '/agreements', icon: Briefcase, roles: ['ADMIN'] }, // Removed SUPER_ADMIN
                { name: 'Marcas', href: '/brands', icon: Tag, roles: ['ADMIN'] }, // Removed SUPER_ADMIN
                { name: 'Usuarios', href: '/users', icon: UserCog, roles: ['ADMIN'] }, // Removed SUPER_ADMIN
                { name: 'Auditoría', href: '/audit-logs', icon: Shield, roles: ['ADMIN'] }, // Removed SUPER_ADMIN
                { name: 'Ajustes', href: '/settings', icon: Settings, roles: ['ADMIN'] }, // Removed SUPER_ADMIN
            ]
        }
    ];

    // Navigation for SaaS SuperAdmin
    const saasNavigationGroups: NavGroup[] = [
        {
            title: 'SaaS Management',
            items: [
                { name: 'Empresas', href: '/admin/tenants', icon: Building2 },
                { name: 'Dashboard Global', href: '/admin/audit-logs', icon: LayoutDashboard }, // Assuming this is general audit
            ]
        }
    ];

    // Select based on role
    const activeGroups = user?.role === 'SUPER_ADMIN' ? saasNavigationGroups : tenantNavigationGroups;

    // Filter groups and items based on permissions (though activeGroups is already role-separated)
    const filteredGroups = activeGroups.map(group => {
        const filteredItems = group.items.filter(item => {
            if (!item.roles) return true;
            return item.roles.includes(user?.role || '');
        });
        return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);


    // Prevent rendering content until tenant context is established
    if (user?.role !== 'SUPER_ADMIN' && !currentTenant && availableTenants.length > 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Cargando empresa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-brand-blue shadow-lg transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="flex h-20 items-center justify-center px-6 border-b border-blue-800 flex-shrink-0">
                    <img src="/LogoTexto.png" alt="Aparca" className="h-16 w-auto brightness-0 invert" />
                    {user?.role === 'SUPER_ADMIN' && (
                        <span className="absolute bottom-2 right-4 text-[10px] font-bold text-brand-yellow tracking-widest bg-brand-blue px-1 rounded">SAAS</span>
                    )}
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute right-4 text-white">
                        <X size={24} />
                    </button>
                </div>

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

                <div className="w-full border-t border-blue-800 p-4 flex-shrink-0 bg-brand-blue">
                    {/* Tenant Context Display */}
                    {currentTenant && (
                        <div className="mb-2 px-4 py-2 bg-blue-900/50 rounded-lg border border-blue-700">
                            <div className="flex items-center text-xs">
                                <Building2 className="mr-2 h-4 w-4 text-brand-yellow" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">{currentTenant.name}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Location Context Display */}
                    {currentLocation && (
                        <div className="mb-3 px-4 py-2 bg-brand-green/20 rounded-lg border border-brand-green/30 group cursor-pointer relative" onClick={() => user?.locations && user.locations.length > 1 && navigate('/select-location')}>
                            <div className="flex items-center text-xs">
                                <MapPin className="mr-2 h-4 w-4 text-brand-green" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">{currentLocation.name}</p>
                                    {user?.locations && user.locations.length > 1 && (
                                        <p className="text-brand-green text-[10px] mt-0.5">Cambiar Sede</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center mb-4 px-4 text-sm text-blue-100">
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{user?.username}</p>
                            <p className="truncate text-xs text-blue-300">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-900/30 hover:text-red-200 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Cerrar Sesión
                    </button>
                    <p className="text-[10px] text-blue-400 mt-4 text-center">v0.0.5 • Aparca SaaS</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm lg:hidden">
                    <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
                        <Menu size={24} />
                    </button>
                    <div className="flex flex-col items-center">
                        <img src="/LogoTexto.png" alt="Aparca" className="h-8 w-auto mb-1" />
                        {currentLocation && (
                            <span className="text-xs text-green-600 font-medium flex items-center">
                                <MapPin size={10} className="mr-1" />
                                {currentLocation.name}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center">
                        <OfflineIndicator />
                    </div>
                </header>

                {/* Trial Expired Blocking Overlay */}
                {currentTenant && (currentTenant as any).plan === 'trial' && (currentTenant as any).trialEndsAt && (() => {
                    const end = new Date((currentTenant as any).trialEndsAt);
                    const now = new Date();
                    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));

                    if (diff < 0 && user?.role !== 'SUPER_ADMIN') {
                        return (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
                                <div className="max-w-md">
                                    <div className="text-red-600 mb-4 flex justify-center">
                                        <AlertCircle size={64} />
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Periodo de Prueba Finalizado</h1>
                                    <p className="text-gray-600 mb-6">
                                        Tu prueba gratuita de 14 días ha expirado.
                                        Para continuar disfrutando de todas las funcionalidades y recuperar el acceso a tus datos,
                                        por favor elige un plan.
                                    </p>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow transition-colors">
                                        Actualizar Plan Ahora
                                    </button>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Main Content (Hidden if expired, unless SuperAdmin) */}
                {(!(currentTenant && (currentTenant as any).plan === 'trial' && (currentTenant as any).trialEndsAt && new Date((currentTenant as any).trialEndsAt) < new Date()) || user?.role === 'SUPER_ADMIN') && (
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                        {/* Trial Banner */}
                        {currentTenant && ((currentTenant as any).plan === 'free' || (currentTenant as any).plan === 'trial') && (currentTenant as any).trialEndsAt && user?.role !== 'SUPER_ADMIN' && (
                            (() => {
                                const end = new Date((currentTenant as any).trialEndsAt);
                                const now = new Date();
                                const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));

                                return (
                                    <div className="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 text-white shadow-lg flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg flex items-center">
                                                <Rocket className="mr-2 h-5 w-5" />
                                                Prueba Gratuita Activa
                                            </h3>
                                            <p className="text-indigo-100 text-sm mt-1">
                                                Te quedan <span className="font-bold text-white text-lg">{diff} días</span> de prueba.
                                                {diff <= 3 && " ¡Actualiza pronto para no perder acceso!"}
                                            </p>
                                        </div>
                                        <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm">
                                            Elegir Plan
                                        </button>
                                    </div>
                                );
                            })()
                        )}

                        <Outlet />
                    </main>
                )}
            </div>

            {/* Tenant Selector Modal - shown when user has multiple tenants and none selected */}
            {showTenantSelector && <TenantSelector />}
        </div>
    );
}
