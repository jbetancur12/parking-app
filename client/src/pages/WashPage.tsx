// React import not needed with new JSX transform
import { Car, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WashServicesModal } from '../components/dashboard/WashServicesModal';
import { useWashPage } from '../hooks/useWashPage';
import { useRef } from 'react';
import { useElectronPrint } from '../hooks/useElectronPrint';
import { PrintSaleReceipt } from '../components/PrintSaleReceipt';
import { WashEntryForm } from '../components/wash/WashEntryForm';
import { WashHistoryList } from '../components/wash/WashHistoryList';
import { formatCurrency } from '../utils/formatters';

export default function WashPage() {
    const { user } = useAuth();
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrintReceipt = useElectronPrint({
        contentRef: receiptRef,
        silent: false
    });

    const {
        // Data
        types,
        entries,
        activeShift,

        // Form
        plate, setPlate,
        selectedType, setSelectedType,
        price, setPrice,
        operator, setOperator,
        paymentMethod, setPaymentMethod,

        // UI
        loading,
        message,
        modalOpen, setModalOpen,

        // Handlers
        handleCreate,
        loadTypes,

        // Print
        printData,
        showPrintConfirm,
        setShowPrintConfirm,
        handleConfirmPrint,
        handleReprint
    } = useWashPage(); // No print hook passed to custom hook? 
    // Wait, useWashPage needs modification if I want to pass the print handler! 
    // Actually, useIncomesPage pattern: passed handlePrintReceipt to hook. 
    // BUT I updated useWashPage to take NO arguments and just manage state.
    // So WashPage manages the actual print trigger via callback from hook state?
    // In useWashPage, handleConfirmPrint takes a callback: (triggerPrint) => ...
    // So I can pass handlePrintReceipt to handleConfirmPrint here.

    if (!activeShift) {
        return <div className="p-8 text-center text-gray-500">No hay un turno activo. Inicie turno en Inicio para registrar servicios.</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-display font-bold text-brand-blue flex items-center">
                    <Car className="mr-2" /> Lavadero de Autos
                </h1>
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'LOCATION_MANAGER') && (
                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
                    >
                        <Settings size={18} className="mr-2" />
                        Configurar Servicios
                    </button>
                )}
            </div>

            <WashServicesModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onUpdate={loadTypes}
            />

            {message && (
                <div className="mb-4 bg-brand-green/10 text-brand-green p-3 rounded-lg text-sm text-center font-bold border border-brand-green/20">
                    {message}
                </div>
            )}

            {/* Form */}
            <WashEntryForm
                onSubmit={handleCreate}
                loading={loading}
                types={types}
                plate={plate}
                setPlate={setPlate}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                price={price}
                setPrice={setPrice}
                operator={operator}
                setOperator={setOperator}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
            />

            {/* List */}
            <WashHistoryList entries={entries} onReprint={handleReprint} />

            {/* Hidden Print Receipt */}
            <div style={{ display: 'none' }}>
                {printData && <PrintSaleReceipt ref={receiptRef} transaction={printData} settings={{ company_name: 'LAVADERO', ticket_width: '58mm' }} />}
            </div>

            {/* Print Confirmation Modal */}
            {showPrintConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4 text-green-600">✅ Lavado Registrado</h2>
                        <div className="mb-6">
                            <p className="text-gray-600">El servicio se ha guardado correctamente.</p>
                            <p className="font-bold text-lg mt-2">{formatCurrency(printData?.amount || 0)}</p>
                        </div>
                        <p className="text-gray-600 mb-6">¿Desea imprimir el recibo?</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowPrintConfirm(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
                            >
                                No
                            </button>
                            <button
                                onClick={() => handleConfirmPrint(handlePrintReceipt)}
                                className="flex-1 bg-brand-blue text-white py-2 rounded hover:bg-blue-700 font-medium"
                            >
                                🖨️ Sí, Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
