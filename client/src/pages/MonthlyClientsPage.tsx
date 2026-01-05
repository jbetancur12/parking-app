import { Users, Plus, Download } from 'lucide-react';
import { useMonthlyClients } from '../hooks/business/useMonthlyClients';
import { useMonthlyClientActions } from '../hooks/business/useMonthlyClientActions';

import { ClientFilterBar } from '../components/monthly/ClientFilterBar';
import { MonthlyClientTable } from '../components/monthly/MonthlyClientTable';
import { ClientActionModals } from '../components/monthly/ClientActionModals';
import { PrintMonthlyReceipt } from '../components/PrintMonthlyReceipt';

export default function MonthlyClientsPage() {
    // 1. Data Layer
    const {
        clients,
        settings,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        createClient,
        renewClient,
        toggleStatus,
        anonymizeClient,
        getHistory
    } = useMonthlyClients();

    // 2. Action/UI Layer
    const {
        isCreateModalOpen, setIsCreateModalOpen,
        isRenewModalOpen, setIsRenewModalOpen,
        isHistoryModalOpen, setIsHistoryModalOpen,
        selectedClient,
        confirmModal,
        closeConfirmModal,
        printRef,
        printData,
        triggerPrint,
        handleCreateSubmit,
        handleRenewSubmit,
        onRenewClick,
        onHistoryClick,
        onToggleStatusClick,
        onAnonymizeClick,
        handleExport
    } = useMonthlyClientActions({
        clients,
        settings,
        createClient,
        renewClient,
        toggleStatus,
        anonymizeClient
    });

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h1 className="text-2xl font-display font-bold text-brand-blue dark:text-white w-full md:w-auto text-center md:text-left flex items-center justify-center md:justify-start">
                    <Users className="mr-2" /> Clientes Mensuales
                </h1>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-brand-yellow text-brand-blue font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 shadow-md flex items-center justify-center flex-1 md:flex-none whitespace-nowrap"
                    >
                        <Plus className="mr-2" size={18} />
                        Nuevo Cliente
                    </button>

                    <button
                        onClick={() => handleExport(filterStatus)}
                        className="text-brand-blue dark:text-blue-300 border border-brand-blue dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2 font-medium flex-1 md:flex-none"
                    >
                        <Download size={18} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Filters */}
            <ClientFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
            />

            {/* Table */}
            <MonthlyClientTable
                clients={clients}
                filterStatus={filterStatus}
                onHistory={onHistoryClick}
                onRenew={onRenewClick}
                onToggleStatus={onToggleStatusClick}
                onAnonymize={onAnonymizeClick}
            />

            {/* Modals & Dialogs */}
            <ClientActionModals
                isCreateModalOpen={isCreateModalOpen}
                setIsCreateModalOpen={setIsCreateModalOpen}
                isRenewModalOpen={isRenewModalOpen}
                setIsRenewModalOpen={setIsRenewModalOpen}
                isHistoryModalOpen={isHistoryModalOpen}
                setIsHistoryModalOpen={setIsHistoryModalOpen}
                selectedClient={selectedClient}
                onCreateSubmit={handleCreateSubmit}
                onRenewSubmit={handleRenewSubmit}
                getHistory={getHistory}
                confirmModal={confirmModal}
                closeConfirmModal={closeConfirmModal}
                onHistoryReprint={(payment) => {
                    if (!selectedClient) return;
                    triggerPrint({
                        paymentId: payment.id,
                        plate: selectedClient.plate,
                        clientName: selectedClient.name,
                        vehicleType: selectedClient.vehicleType,
                        amount: payment.amount,
                        periodStart: payment.periodStart,
                        periodEnd: payment.periodEnd,
                        paymentDate: payment.paymentDate,
                        concept: 'COPIA DE RECIBO',
                        receiptNumber: payment.receiptNumber
                    });
                }}
            />

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                {printData && (
                    <PrintMonthlyReceipt
                        ref={printRef}
                        data={printData}
                        settings={settings}
                    />
                )}
            </div>
        </div>
    );
}
