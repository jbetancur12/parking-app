import { useShiftHistoryPage } from '../hooks/useShiftHistoryPage';
import { ShiftHistoryList } from '../components/shifts/ShiftHistoryList';
import { PrintShiftSummary } from '../components/PrintShiftSummary';

export default function ShiftHistoryPage() {
    const {
        shifts,
        loading,
        selectedShift,
        settings,
        shiftSummaryRef,
        handlePrint,
        hasPermission
    } = useShiftHistoryPage();

    // Check permissions
    if (!hasPermission) {
        return (
            <div className="p-8">
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    No tienes permisos para acceder a esta página.
                </div>
            </div>
        );
    }

    if (loading) return <div className="p-8">Cargando...</div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-brand-blue dark:text-white">Historial de Turnos</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Consulta y gestiona todos los turnos cerrados</p>
            </div>

            <ShiftHistoryList shifts={shifts} onPrint={handlePrint} />

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                {selectedShift && (
                    <PrintShiftSummary
                        ref={shiftSummaryRef}
                        summary={{
                            baseAmount: selectedShift.baseAmount,
                            totalIncome: selectedShift.totalIncome,
                            totalExpenses: selectedShift.totalExpenses,
                            expectedCash: selectedShift.expectedCash,
                            declaredAmount: selectedShift.declaredAmount,
                            difference: selectedShift.difference,
                            transactionCount: 0, // Not available in history
                            cashIncome: selectedShift.cashIncome,
                            transferIncome: selectedShift.transferIncome
                        }}
                        shift={{
                            startTime: selectedShift.startTime,
                            endTime: selectedShift.endTime
                        }}
                        user={{
                            username: selectedShift.user.username
                        }}
                        settings={settings}
                    />
                )}
            </div>
        </div>
    );
}
