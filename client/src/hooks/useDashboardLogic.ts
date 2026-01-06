import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSaas } from '../context/SaasContext';
import { useOffline } from '../context/OfflineContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard, Car, Droplets, Users, TrendingDown, DollarSign,
    Receipt, History, FileText, Briefcase, Package, UserCog, Shield,
    Settings, Building2, CreditCard, Bell
} from 'lucide-react';

export type NavItem = {
    name: string;
    href: string;
    icon: any;
    roles?: string[];
};

export type NavGroup = {
    title: string;
    items: NavItem[];
};

export const useDashboardLogic = () => {
    const { user, logout } = useAuth();
    const { isOnline } = useOffline();
    const { theme, toggleTheme } = useTheme();
    const { currentTenant, currentLocation, availableTenants } = useSaas();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openGroups, setOpenGroups] = useState<string[]>(
        user?.role === 'SUPER_ADMIN' ? ['SaaS Management'] : ['Operación', 'Finanzas']
    );
    const location = useLocation();
    const navigate = useNavigate();

    // Navigation for Tenant/Operation Users (ADMIN, USER)
    const tenantNavigationGroups: NavGroup[] = [
        {
            title: 'Operación',
            items: [
                { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
                { name: 'Parqueo', href: '/parking', icon: Car },
                { name: 'Lavadero', href: '/wash', icon: Droplets },
                { name: 'Mensualidades', href: '/monthly', icon: Users },
            ]
        },
        {
            title: 'Finanzas',
            items: [
                { name: 'Egresos', href: '/expenses', icon: TrendingDown },
                { name: 'Ingresos', href: '/incomes', icon: DollarSign },
                { name: 'Transacciones', href: '/transactions', icon: Receipt, roles: ['ADMIN', 'LOCATION_MANAGER'] },
                { name: 'Historial Turnos', href: '/shifts', icon: History, roles: ['ADMIN', 'LOCATION_MANAGER'] },
                { name: 'Reportes', href: '/reports', icon: FileText, roles: ['ADMIN', 'LOCATION_MANAGER'] },
            ]
        },
        {
            title: 'Administración',
            items: [
                { name: 'Convenios', href: '/agreements', icon: Briefcase, roles: ['ADMIN', 'LOCATION_MANAGER'] },
                { name: 'Inventario', href: '/inventory', icon: Package, roles: ['ADMIN', 'LOCATION_MANAGER'] },
                { name: 'Usuarios', href: '/users', icon: UserCog, roles: ['ADMIN'] },
                { name: 'Auditoría', href: '/audit-logs', icon: Shield, roles: ['ADMIN', 'LOCATION_MANAGER'] },
                { name: 'Ajustes', href: '/settings', icon: Settings, roles: ['ADMIN', 'LOCATION_MANAGER'] },
            ]
        }
    ];

    // Navigation for SaaS SuperAdmin
    const saasNavigationGroups: NavGroup[] = [
        {
            title: 'SaaS Management',
            items: [
                { name: 'Empresas', href: '/admin/tenants', icon: Building2 },
                { name: 'Usuarios', href: '/admin/users', icon: Users },
                { name: 'Facturación', href: '/admin/billing', icon: CreditCard },
                { name: 'Planes', href: '/admin/pricing', icon: DollarSign },
                { name: 'Notificaciones', href: '/admin/notifications', icon: Bell },
                { name: 'Dashboard Global', href: '/admin/dashboard', icon: LayoutDashboard },
            ]
        }
    ];

    const activeGroups = user?.role === 'SUPER_ADMIN' ? saasNavigationGroups : tenantNavigationGroups;

    const filteredGroups = activeGroups.map(group => {
        const filteredItems = group.items.filter(item => {
            if (!item.roles) return true;
            return item.roles.includes(user?.role || '');
        });
        return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);

    // Redirect to location selection if needed
    useEffect(() => {
        if (user?.locations && user.locations.length > 1 && !currentLocation) {
            navigate('/select-location');
        }
    }, [user, currentLocation, navigate]);

    // Validation
    useEffect(() => {
        const isElectron = import.meta.env.VITE_APP_MODE === 'electron';
        if (!isElectron) return;

        const verifyAccess = async () => {
            try {
                const result = await (window as any).electronAPI?.validateLicense();
                if (!result || !result.isValid) {
                    console.warn('License invalid during session - forcing logout/activation');
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

    const showTenantSelector = availableTenants.length > 1 && !currentTenant;

    return {
        user,
        logout,
        isOnline,
        theme,
        toggleTheme,
        currentTenant,
        currentLocation,
        availableTenants,
        isSidebarOpen,
        setIsSidebarOpen,
        openGroups,
        toggleSidebar,
        toggleGroup,
        filteredGroups,
        showTenantSelector,
        location,
        navigate
    };
};
