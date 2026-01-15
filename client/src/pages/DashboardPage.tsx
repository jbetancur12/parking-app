import { useRef, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useShiftActions } from '../hooks/useShiftActions';
import { useElectronPrint } from '../hooks/useElectronPrint';

import { settingService } from '../services/setting.service';

import { Skeleton } from '../components/Skeleton';
import { PrintShiftSummary } from '../components/PrintShiftSummary';
import { UsageBanner } from '../components/UsageBanner';
import { useUsageLimits } from '../hooks/useUsageLimits';

// Component Imports
import { ShiftManagementCard } from '../components/dashboard/ShiftManagementCard';
import { OccupancyCard } from '../components/dashboard/OccupancyCard';
import { FinancialStatsGrid } from '../components/dashboard/FinancialStatsGrid';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { CloseShiftModal } from '../components/dashboard/CloseShiftModal';
import { ShiftSummaryModal } from '../components/dashboard/ShiftSummaryModal';
import { SuperAdminDashboard } from '../components/dashboard/SuperAdminDashboard';

// TODO: REMOVE AFTER TESTING - Solo para probar Error Boundary
import TestErrorBoundary from '../components/TestErrorBoundary';

export default function DashboardPage() {
    const { user } = useAuth();

    // Logic Hooks
    const {
        stats,
        occupancy,
        consolidatedData,
        loading,
    } = useDashboardStats();

    const { usage, hasWarnings } = useUsageLimits();

    const {
        activeShift,
        baseAmount,
        setBaseAmount,
        error,
        showCloseModal,
        setShowCloseModal,
        showSummaryModal,
        setShowSummaryModal,
        summaryData,
        closedShiftData,
        handleOpenShift,
        handleCloseShift
    } = useShiftActions();

    // Print Logic
    const [settings, setSettings] = useState<any>(null);
    const shiftSummaryRef = useRef<HTMLDivElement>(null);

    const handlePrintShiftSummary = useElectronPrint({
        contentRef: shiftSummaryRef,
        silent: settings?.show_print_dialog === 'false'
    });

    useEffect(() => {
        settingService.getAll().then(setSettings).catch(console.error);
    }, []);

    const onPrintSummary = () => {
        setShowSummaryModal(false);
        setTimeout(() => handlePrintShiftSummary(), 100);
    };

    if (loading) return (
        <div>
            <Skeleton className="h-10 w-64 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        </div>
    );

    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'LOCATION_MANAGER';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    if (isSuperAdmin) {
        return (
            <div>
                <h1 className="text-3xl font-display font-bold text-brand-blue mb-6">Panel Super Admin</h1>
                <SuperAdminDashboard />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-display font-bold text-brand-blue dark:text-white mb-6">Bienvenido, {user?.username}</h1>

            {/* Usage Warning Banner - Shows only when approaching limits (10% remaining) */}
            {hasWarnings && usage && <UsageBanner usage={usage} />}

            {/* ZONA 1: OPERATIVA INMEDIATA */}
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Operativa Inmediata</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Columna 1 & 2: Gestión de Turno */}
                <div className="lg:col-span-2">
                    <ShiftManagementCard
                        activeShift={activeShift}
                        baseAmount={baseAmount}
                        onBaseAmountChange={setBaseAmount}
                        onOpenShift={handleOpenShift}
                        onCloseShiftRequire={() => setShowCloseModal(true)}
                    />
                </div>

                {/* Columna 3: Ocupación en Tiempo Real */}
                <OccupancyCard occupancy={occupancy} />
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center font-bold">
                    <AlertCircle className="mr-2" size={20} />
                    {error}
                </div>
            )}

            {/* ZONA 2: KPIS FINANCIEROS (Admin Only) */}
            {isAdminOrManager && consolidatedData && (
                <>
                    <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">KPIs Financieros (Hoy)</h2>
                    <FinancialStatsGrid consolidatedData={consolidatedData} />

                    {/* ZONA 3: ANÁLISIS PROFUNDO */}
                    <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Análisis Profundo</h2>
                    <DashboardCharts stats={stats} consolidatedData={consolidatedData} />
                </>
            )}

            {/* Modals */}
            <CloseShiftModal
                isOpen={showCloseModal}
                onClose={() => setShowCloseModal(false)}
                baseAmount={activeShift?.baseAmount || '0'}
                onConfirm={handleCloseShift}
            />

            <ShiftSummaryModal
                isOpen={showSummaryModal}
                onClose={() => setShowSummaryModal(false)}
                summaryData={summaryData}
                onPrint={onPrintSummary}
            />

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                {closedShiftData && (
                    <PrintShiftSummary
                        ref={shiftSummaryRef}
                        summary={closedShiftData.summary}
                        shift={closedShiftData.shift}
                        user={closedShiftData.user}
                        settings={settings}
                    />
                )}
            </div>

            {/* TODO: REMOVE AFTER TESTING - Botón para probar Error Boundary (solo dev) */}
            <TestErrorBoundary />
        </div>
    );
}
