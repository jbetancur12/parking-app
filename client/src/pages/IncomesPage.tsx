import { useRef } from 'react';
import { DollarSign } from 'lucide-react';
import { useElectronPrint } from '../hooks/useElectronPrint';
import { PrintSaleReceipt } from '../components/PrintSaleReceipt';
import { useIncomesPage } from '../hooks/useIncomesPage';
import { TransactionPrintManager } from '../components/common/TransactionPrintManager';

// Components
import { ManualIncomeForm } from '../components/incomes/ManualIncomeForm';
import { POSView } from '../components/incomes/POSView';
import { IncomeList } from '../components/incomes/IncomeList';

export default function IncomesPage() {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrintReceipt = useElectronPrint({
        contentRef: receiptRef,
        silent: false // We can update this logic if strictly needed, but false is safe default
    });

    const {
        // State
        activeShift,
        settings,
        mode, setMode,
        transactions,
        loading,

        // Manual Form
        description, setDescription,
        amount, setAmount,
        manualPaymentMethod, setManualPaymentMethod,

        // POS
        products,
        cart,
        addToCart,
        removeFromCart,
        posPaymentMethod, setPosPaymentMethod,
        calculateCartTotal,

        // Print
        printData,
        showPrintConfirm, setShowPrintConfirm,
        handleConfirmPrint,
        handleReprint,

        // Handlers
        handleManualSubmit,
        handlePOSSubmit
    } = useIncomesPage(handlePrintReceipt);

    if (!activeShift) {
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">No hay un turno activo. Inicie turno en Inicio para registrar ingresos.</div>;
    }

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-display font-bold text-brand-blue dark:text-white flex items-center">
                    <DollarSign className="mr-2" /> Ingresos & Ventas
                </h1>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('POS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${mode === 'POS' ? 'bg-white dark:bg-gray-600 text-brand-blue dark:text-white ring-1 ring-black/5 dark:ring-gray-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Punto de Venta
                    </button>
                    <button
                        onClick={() => setMode('MANUAL')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${mode === 'MANUAL' ? 'bg-white dark:bg-gray-600 text-brand-blue dark:text-white ring-1 ring-black/5 dark:ring-gray-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Manual
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            {mode === 'MANUAL' ? (
                <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden h-[calc(100vh-200px)] md:h-auto">
                    <div className="flex-1 overflow-y-auto pr-0 md:pr-2 pb-20 md:pb-0">
                        <ManualIncomeForm
                            onSubmit={handleManualSubmit}
                            loading={loading}
                            description={description}
                            setDescription={setDescription}
                            amount={amount}
                            setAmount={setAmount}
                            paymentMethod={manualPaymentMethod}
                            setPaymentMethod={setManualPaymentMethod}
                        />

                        {/* Transaction History */}
                        <IncomeList
                            transactions={transactions}
                            onReprint={handleReprint}
                        />
                    </div>
                </div>
            ) : (
                <POSView
                    products={products}
                    cart={cart}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    total={calculateCartTotal()}
                    paymentMethod={posPaymentMethod}
                    setPaymentMethod={setPosPaymentMethod}
                    onSubmit={handlePOSSubmit}
                    loading={loading}
                />
            )}

            {/* Print Manager */}
            <TransactionPrintManager
                printData={printData}
                showConfirm={showPrintConfirm}
                onCancel={() => setShowPrintConfirm(false)}
                onConfirm={handleConfirmPrint}
                receiptRef={receiptRef}
                ReceiptComponent={PrintSaleReceipt}
                settings={settings}
                title="✅ Venta Registrada"
                successMessage="La transacción se ha guardado correctamente."
            />
        </div>
    );
}
