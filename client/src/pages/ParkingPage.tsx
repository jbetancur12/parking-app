import React, { useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { useElectronPrint } from '../hooks/useElectronPrint';
import { PrintTicket } from '../components/PrintTicket';
import { PrintReceipt } from '../components/PrintReceipt';
import { useParkingPage } from '../hooks/useParkingPage';

// Components
import { ParkingSessionList } from '../components/parking/ParkingSessionList';
import { EntryModal } from '../components/parking/EntryModal';
import { ExitPreviewModal } from '../components/parking/ExitPreviewModal';
import { PrintConfirmationModal } from '../components/parking/PrintConfirmationModal';
import { ExitSuccessModal } from '../components/parking/ExitSuccessModal';

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
        getPlanLabel
    } = useParkingPage(
        handlePrintTicket
    );

    // Search Enter Logic
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
                <h1 className="text-2xl font-display font-bold text-brand-blue w-full md:w-auto text-center md:text-left">Gestión de Parqueadero</h1>
                <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                    <button
                        onClick={handleOpenEntryModal}
                        disabled={!activeShift}
                        title={!activeShift ? "Debe iniciar turno para registrar vehículos" : "Registrar nueva entrada"}
                        className={`flex w-full md:w-auto justify-center items-center font-bold px-4 py-3 md:py-2 rounded-lg shadow-md transform transition-all ${activeShift
                            ? 'bg-brand-yellow text-brand-blue hover:bg-yellow-400 active:scale-95 cursor-pointer'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        data-testid="btn-open-entry-modal"
                    >
                        <Plus className="mr-2" size={20} />
                        Nueva Entrada
                    </button>
                    {!activeShift && (
                        <span className="text-xs text-red-500 font-bold mt-1 flex items-center bg-red-50 px-2 py-1 rounded-full border border-red-100">
                            <span className="mr-1">⚠️</span> Requiere Turno Activo
                        </span>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por placa o escanear ticket..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none uppercase transition-shadow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    onKeyDown={handleSearchKeyDown}
                    autoFocus
                />
            </div>

            {/* Session List */}
            <ParkingSessionList
                sessions={filteredSessions}
                loading={loading}
                searchTerm={searchTerm}
                getPlanLabel={getPlanLabel}
                onReprint={handleReprintTicket}
                onExit={handleExitClick}
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
