import React, { useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { useElectronPrint } from '../hooks/useElectronPrint';
import { PrintTicket } from '../components/PrintTicket';
import { PrintReceipt } from '../components/PrintReceipt';
import { useParkingPage } from '../hooks/business/useParkingPage';
import ChangeVehicleTypeModal from '../components/ChangeVehicleTypeModal';

// Components
import { ParkingSessionList } from '../components/parking/ParkingSessionList';
import { EntryModal } from '../components/parking/EntryModal';
import { ExitPreviewModal } from '../components/parking/ExitPreviewModal';
import { PrintConfirmationModal } from '../components/parking/PrintConfirmationModal';
import { ExitSuccessModal } from '../components/parking/ExitSuccessModal';
import { ExitHistoryModal } from '../components/parking/ExitHistoryModal';
import { History } from 'lucide-react';

export default function ParkingPage() {
    // Print refs (Must be in valid DOM context)
    const ticketRef = useRef<HTMLDivElement>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Print Handlers
    const handlePrintTicket = useElectronPrint({
        contentRef: ticketRef,
        silent: false // Control via hook if needed, but defaults valid
    });

    const handlePrintReceipt = useElectronPrint({
        contentRef: receiptRef,
        silent: false
    });

    // Main Hook
    const {
        sessions,
        filteredSessions,
        loading,
        settings,
        tariffs,
        agreements,
        activeShift,

        searchTerm,
        setSearchTerm,
        isEntryModalOpen,
        setIsEntryModalOpen,
        isSubmitting,

        previewData,
        setPreviewData,
        exitResult,
        setExitResult,
        printData,

        showPrintConfirm,
        pendingPrintSession,

        handleOpenEntryModal,
        handleEntrySubmit,
        handleExitClick,
        confirmExit,
        handleReprintTicket,
        handleConfirmPrintEntry,
        handleCancelPrintEntry,
        getPlanLabel,
        handleReprintReceipt,
        handleDeleteSession,
        handleChangeVehicleType
    } = useParkingPage(
        handlePrintTicket,
        handlePrintReceipt // Pass receipt handler to hook if needed (or keep in page)
    );

    // History Modal State
    const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);

    // Change Vehicle Type Modal State
    const [changeVehicleTypeModal, setChangeVehicleTypeModal] = React.useState<{ isOpen: boolean; session: any | null }>({ isOpen: false, session: null });

    // Reprint Receipt Handler (from History)


    // Search Input Ref
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Aggressive Autofocus Logic
    React.useEffect(() => {
        if (!isEntryModalOpen && !previewData && !exitResult && !isHistoryModalOpen && !showPrintConfirm) {
            // Small timeout to ensure modals are fully unmounted/hidden
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isEntryModalOpen, previewData, exitResult, isHistoryModalOpen, showPrintConfirm]);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchTerm) {
            e.preventDefault();
            // 1. Try exact match
            const exactMatch = sessions.find(s => s.plate === searchTerm);
            if (exactMatch) {
                handleExitClick(exactMatch.plate);
                setSearchTerm('');
            } else {
                // 2. Filter match
                const currentFiltered = sessions.filter(s => s.plate.includes(searchTerm));
                if (currentFiltered.length === 1) {
                    handleExitClick(currentFiltered[0].plate);
                    setSearchTerm('');
                }
            }
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h1 className="text-2xl font-display font-bold text-brand-blue dark:text-white w-full md:w-auto text-center md:text-left">Gestión de Parqueadero</h1>
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleOpenEntryModal}
                        disabled={!activeShift}
                        title={!activeShift ? "Debe iniciar turno para registrar vehículos" : "Registrar nueva entrada"}
                        className={`flex w-full md:w-auto justify-center items-center font-bold px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 ${activeShift
                            ? 'bg-brand-yellow text-brand-blue hover:bg-yellow-400 hover:scale-105 active:scale-95 cursor-pointer border-2 border-transparent'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-2 border-gray-100 dark:border-gray-700'
                            }`}
                        data-testid="btn-open-entry-modal"
                    >
                        <Plus className="mr-2" size={22} />
                        Nueva Entrada
                    </button>

                    <button
                        onClick={() => setIsHistoryModalOpen(true)}
                        disabled={!activeShift}
                        className={`flex w-full md:w-auto justify-center items-center font-bold px-6 py-3 rounded-xl shadow-md transform transition-all duration-200 ${activeShift
                            ? 'bg-white dark:bg-gray-800 text-brand-blue dark:text-blue-300 border-2 border-brand-blue dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 hover:scale-105 cursor-pointer'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-2 border-gray-100 dark:border-gray-700 cursor-not-allowed'
                            }`}
                    >
                        <History className="mr-2" size={22} />
                        Salidas / Recibos
                    </button>

                    {!activeShift && (
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100 shadow-sm whitespace-nowrap">
                            ⚠️ Requiere Turno
                        </span>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Buscar por placa o escanear ticket..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none uppercase transition-shadow bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                        onKeyDown={handleSearchKeyDown}
                        autoFocus
                    />
                </div>
                {/* UX Hint */}
                <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-end px-1">
                    <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono mr-1 border border-gray-200 dark:border-gray-600">ENTER</span>
                    <span>para salida rápida</span>
                </div>
            </div>

            {/* Session List */}
            <ParkingSessionList
                sessions={filteredSessions}
                loading={loading}
                searchTerm={searchTerm}
                getPlanLabel={getPlanLabel}
                onReprint={handleReprintTicket}
                onExit={handleExitClick}
                onDelete={handleDeleteSession}
                onChangeVehicleType={(session) => setChangeVehicleTypeModal({ isOpen: true, session })}
            />

            {/* Modals */}
            <EntryModal
                isOpen={isEntryModalOpen}
                onClose={() => setIsEntryModalOpen(false)}
                onSubmit={handleEntrySubmit}
                tariffs={tariffs}
                isSubmitting={isSubmitting}
            />

            {previewData && (
                <ExitPreviewModal
                    previewData={previewData}
                    agreements={agreements}
                    tariffs={tariffs}
                    onCancel={() => setPreviewData(null)}
                    onConfirm={confirmExit}
                    isSubmitting={isSubmitting}
                />
            )}

            {showPrintConfirm && pendingPrintSession && (
                <PrintConfirmationModal
                    session={pendingPrintSession}
                    tariffs={tariffs}
                    onConfirm={handleConfirmPrintEntry}
                    onCancel={handleCancelPrintEntry}
                />
            )}

            {exitResult && (
                <ExitSuccessModal
                    exitResult={exitResult}
                    onClose={() => setExitResult(null)}
                    onPrint={() => setTimeout(() => handlePrintReceipt(), 100)}
                />
            )}

            <ExitHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                onReprint={handleReprintReceipt}
            />

            <ChangeVehicleTypeModal
                isOpen={changeVehicleTypeModal.isOpen}
                onClose={() => setChangeVehicleTypeModal({ isOpen: false, session: null })}
                onConfirm={(newType) => {
                    if (changeVehicleTypeModal.session) {
                        handleChangeVehicleType(changeVehicleTypeModal.session.id, newType);
                    }
                }}
                currentVehicleType={changeVehicleTypeModal.session?.vehicleType || ''}
                sessionId={changeVehicleTypeModal.session?.id || ''}
                plate={changeVehicleTypeModal.session?.plate || ''}
            />

            {/* Hidden Print Components */}
            <div style={{ display: 'none' }}>
                {printData && printData.type === 'ticket' && (
                    <PrintTicket ref={ticketRef} session={printData.session} settings={settings} />
                )}
                {printData && printData.type === 'receipt' && (
                    <PrintReceipt ref={receiptRef} session={printData.session} settings={settings} />
                )}
            </div>
        </div>
    );
}
