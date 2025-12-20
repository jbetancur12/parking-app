import { useAuth } from '../context/AuthContext';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, LogOut, FileText, Settings, Menu, X, Users, Tag, TrendingDown, DollarSign, Droplets, UserCog, History, Receipt, Shield, Briefcase } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Base navigation (Everyone)
    const baseNavigation = [
        { name: 'Inicio', href: '/', icon: LayoutDashboard },
        { name: 'Parqueo', href: '/parking', icon: Car },
        { name: 'Egresos', href: '/expenses', icon: TrendingDown },
        { name: 'Ingresos', href: '/incomes', icon: DollarSign },
        { name: 'Lavadero', href: '/wash', icon: Droplets },
        { name: 'Mensualidades', href: '/monthly-clients', icon: Users },
    ];

    // Admin/SuperAdmin only
    const adminNavigation = [
        { name: 'Transacciones', href: '/transactions', icon: Receipt },
        { name: 'Reportes', href: '/reports', icon: FileText },
        { name: 'Marcas', href: '/brands', icon: Tag },
        { name: 'Ajustes', href: '/settings', icon: Settings },
        { name: 'Historial Turnos', href: '/shift-history', icon: History },
        { name: 'Historial Turnos', href: '/shift-history', icon: History },
        { name: 'Usuarios', href: '/users', icon: UserCog },
        { name: 'Auditoría', href: '/audit', icon: Shield },
        { name: 'Convenios', href: '/agreements', icon: Briefcase }
    ];

    let navigationItems = [...baseNavigation];

    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
        navigationItems = [...baseNavigation, ...adminNavigation];
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
            <div className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="flex h-16 items-center justify-between px-6 border-b flex-shrink-0">
                    <span className="text-xl font-bold text-gray-800">ParkingSof</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
                        <X size={24} />
                    </button>
                </div>
                <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
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
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm lg:hidden">
                    <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-gray-800">ParkingSof</span>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
