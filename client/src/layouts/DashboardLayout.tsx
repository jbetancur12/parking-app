import { Outlet } from 'react-router-dom';
import TenantSelector from '../components/TenantSelector';
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import { DashboardSidebar } from '../components/dashboard/layout/DashboardSidebar';
import { DashboardHeader } from '../components/dashboard/layout/DashboardHeader';
import { DashboardOfflineBanner } from '../components/dashboard/layout/DashboardOfflineBanner';
import { Rocket, AlertCircle } from 'lucide-react';
import { GlobalNotificationBanner } from '../components/common/GlobalNotificationBanner';

export default function DashboardLayout() {
    const {
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
        logout,
        toggleSidebar,
        availableTenants,
        isOnline,
        showTenantSelector
    } = useDashboardLogic();

    // Prevent rendering content until tenant context is established
    if (user?.role !== 'SUPER_ADMIN' && !currentTenant && availableTenants.length > 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <p className="text-gray-600 dark:text-gray-300">Cargando empresa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <DashboardSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                filteredGroups={filteredGroups}
                openGroups={openGroups}
                toggleGroup={toggleGroup}
                location={location}
                currentTenant={currentTenant}
                currentLocation={currentLocation}
                user={user}
                navigate={navigate}
                theme={theme}
                toggleTheme={toggleTheme}
                logout={logout}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardOfflineBanner isOnline={isOnline} />
                <GlobalNotificationBanner />

                <DashboardHeader
                    toggleSidebar={toggleSidebar}
                    currentLocation={currentLocation}
                />

                {/* Trial Expired Blocking Overlay */}
                {
                    currentTenant && currentTenant.plan === 'trial' && currentTenant.trialEndsAt && (() => {
                        const end = new Date(currentTenant.trialEndsAt);
                        const now = new Date();
                        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));

                        if (diff < 0 && user?.role !== 'SUPER_ADMIN') {
                            return (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 text-center">
                                    <div className="max-w-md">
                                        <div className="text-red-600 mb-4 flex justify-center">
                                            <AlertCircle size={64} />
                                        </div>
                                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Periodo de Prueba Finalizado</h1>
                                        <p className="text-gray-600 dark:text-gray-300 mb-6">
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
                    })()
                }

                {/* Main Content (Hidden if expired, unless SuperAdmin) */}
                {
                    (!(currentTenant && currentTenant.plan === 'trial' && currentTenant.trialEndsAt && new Date(currentTenant.trialEndsAt) < new Date()) || user?.role === 'SUPER_ADMIN') && (
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6 transition-colors duration-200">
                            {/* Trial Banner */}
                            {currentTenant && (currentTenant.plan === 'basic' || currentTenant.plan === 'trial') && currentTenant.trialEndsAt && user?.role !== 'SUPER_ADMIN' && (
                                (() => {
                                    const end = new Date(currentTenant.trialEndsAt);
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
                    )
                }
            </div>

            {/* Tenant Selector Modal - shown when user has multiple tenants and none selected */}
            {showTenantSelector && <TenantSelector />}
        </div>
    );
}
