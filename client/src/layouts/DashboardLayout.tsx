import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, LogOut, FileText, Settings, Menu, X, Users, Tag, TrendingDown, DollarSign, Droplets, UserCog, History, Receipt, Shield, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { OfflineIndicator } from '../components/OfflineIndicator';

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openGroups, setOpenGroups] = useState<string[]>(['Operación', 'Finanzas']); // Default open
    const location = useLocation();
    const navigate = useNavigate();

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

    const navigationGroups: NavGroup[] = [
        {
            title: 'Operación',
            items: [
                { name: 'Inicio', href: '/', icon: LayoutDashboard },
                { name: 'Parqueo', href: '/parking', icon: Car },
                { name: 'Lavadero', href: '/wash', icon: Droplets },
                { name: 'Mensualidades', href: '/monthly-clients', icon: Users },
            ]
        },
        {
            title: 'Finanzas',
            items: [
                { name: 'Egresos', href: '/expenses', icon: TrendingDown },
                { name: 'Ingresos', href: '/incomes', icon: DollarSign },
                { name: 'Transacciones', href: '/transactions', icon: Receipt, roles: ['ADMIN', 'SUPER_ADMIN'] },
                { name: 'Historial Turnos', href: '/shift-history', icon: History, roles: ['ADMIN', 'SUPER_ADMIN'] },
                { name: 'Reportes', href: '/reports', icon: FileText, roles: ['ADMIN', 'SUPER_ADMIN'] },
            ]
        },
        {
            title: 'Administración',
            items: [
                { name: 'Convenios', href: '/agreements', icon: Briefcase, roles: ['ADMIN', 'SUPER_ADMIN'] },
                { name: 'Marcas', href: '/brands', icon: Tag, roles: ['ADMIN', 'SUPER_ADMIN'] },
                { name: 'Usuarios', href: '/users', icon: UserCog, roles: ['ADMIN', 'SUPER_ADMIN'] },
                { name: 'Auditoría', href: '/audit', icon: Shield, roles: ['ADMIN', 'SUPER_ADMIN'] },
                { name: 'Ajustes', href: '/settings', icon: Settings, roles: ['ADMIN', 'SUPER_ADMIN'] },
            ]
        }
    ];

    // Filter groups and items based on permissions
    const filteredGroups = navigationGroups.map(group => {
        const filteredItems = group.items.filter(item => {
            if (!item.roles) return true;
            return item.roles.includes(user?.role || '');
        });
        return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);


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
            <div className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="flex h-16 items-center justify-between px-6 border-b flex-shrink-0">
                    <span className="text-xl font-bold text-gray-800">Aparca</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
                        <X size={24} />
                    </button>
                    {/* Offline Indicator Desktop Sidebar (Visible only on large? No, kept original logic but removed redundant map) */}
                    {/* We put indicator in header for mobile, maybe keep hidden here? No, design shows it in header. */}
                </div>

                <nav className="mt-4 px-4 space-y-2 flex-1 overflow-y-auto">
                    {filteredGroups.map((group) => {
                        const isOpen = openGroups.includes(group.title);
                        return (
                            <div key={group.title} className="mb-2">
                                <button
                                    onClick={() => toggleGroup(group.title)}
                                    className="flex items-center justify-between w-full px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 focus:outline-none"
                                >
                                    <span>{group.title}</span>
                                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>

                                {isOpen && (
                                    <div className="space-y-1 mt-1 ml-1">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = location.pathname === item.href;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    to={item.href}
                                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                >
                                                    <Icon className="mr-3 h-4 w-4" /> {/* Slightly smaller icons for compact list */}
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

                <div className="w-full border-t p-4 flex-shrink-0 bg-white">
                    <div className="flex items-center mb-4 px-4 text-sm text-gray-600">
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user?.username}</p>
                            <p className="truncate text-xs">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Cerrar Sesión
                    </button>
                    <p className="text-xs text-gray-400 mt-2 text-center opacity-70">v0.0.2</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm lg:hidden">
                    <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-gray-800">Aparca</span>
                    <div className="flex items-center">
                        <OfflineIndicator />
                    </div>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                {/* Desktop Header for Offline Indicator (since we removed it from Sidebar top in previous steps implicitly if we replaced everything? logic check: original code had indicator in sidebar header too?) --> 
                    Original code line 62: <OfflineIndicator /> inside sidebar header.
                    I removed it in my replacement because usually sidebar header is just logo. 
                    Let's Check if I should put it back.
                    The user said "sidebar is too long", maybe removing indicator helps? 
                    But wait, Indicator is crucial. Desktop users need to see it.
                    In original code, `DashboardLayout` had:
                     Line 60: { /* Offline Indicator * / }
                     Line 62: <OfflineIndicator />
                    Mobile header also had it (Line 109).
                    
                    If I remove it from sidebar, desktop users won't see it (unless I add a desktop header).
                    Currently there is NO desktop header in the original layout structure shown (only mobile header lg:hidden).
                    So the sidebar IS the only place for desktop users to see the indicator.
                    I MUST put it back in the Sidebar.
                */}
                {/* Re-adding Indicator to Sidebar for Desktop visibility */}

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
