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
import { TransactionPrintManager } from '../components/common/TransactionPrintManager';

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
    } = useWashPage();

    if (!activeShift) {
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">No hay un turno activo. Inicie turno en Inicio para registrar servicios.</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-display font-bold text-brand-blue dark:text-white flex items-center">
                    <Car className="mr-2" /> Lavadero de Autos
                </h1>
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'LOCATION_MANAGER') && (
                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
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
                <div className="mb-4 bg-brand-green/10 dark:bg-green-900/30 text-brand-green dark:text-green-300 p-3 rounded-lg text-sm text-center font-bold border border-brand-green/20 dark:border-green-800">
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

            {/* Print Manager */}
            <TransactionPrintManager
                printData={printData}
                showConfirm={showPrintConfirm}
                onCancel={() => setShowPrintConfirm(false)}
                onConfirm={() => handleConfirmPrint(handlePrintReceipt)}
                receiptRef={receiptRef}
                ReceiptComponent={PrintSaleReceipt}
                settings={{ company_name: 'LAVADERO', ticket_width: '58mm' }}
                title="✅ Lavado Registrado"
                successMessage="El servicio se ha guardado correctamente."
            />
        </div>
    );
}
