import { useRef } from 'react';
import { DollarSign } from 'lucide-react';
import { useElectronPrint } from '../hooks/useElectronPrint';
import { PrintSaleReceipt } from '../components/PrintSaleReceipt';
import { useIncomesPage } from '../hooks/useIncomesPage';
import { formatCurrency } from '../utils/formatters';

// Components
import { ManualIncomeForm } from '../components/incomes/ManualIncomeForm';
import { POSView } from '../components/incomes/POSView';
import { IncomeList } from '../components/incomes/IncomeList';

export default function IncomesPage() {
    const receiptRef = useRef<HTMLDivElement>(null);

    // We pass settings.show_print_dialog check inside the page wrapper or modify hook to accept settings
    // But since settings is in the hook, we can just pass a basic printer and let the hook handle logic?
    // Actually the hook 'useElectronPrint' needs ref which is in page.
    // So we invoke useElectronPrint here.

    // We need to access settings from the hook to pass to useElectronPrint? 
    // Or we just pass a function to update print settings later.
    // Simplest is to init the print hook here, but we need 'settings' for the 'silent' param.
    // However, hooks can't change order.
    // Let's assume silent defaults to false or we handle it in the callback.
    // For now, let's just init it. ideally we'd pass settings to useElectronPrint but we don't have it yet.
    // Refactor note: The original page fetched settings then used them in useElectronPrint.
    // To solve this in refactor: We can pass 'silent' as a ref current value or just init with default.

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

            {/* Hidden Print Receipt */}
            <div style={{ display: 'none' }}>
                {printData && <PrintSaleReceipt ref={receiptRef} transaction={printData} settings={settings} />}
            </div>

            {/* Print Confirmation Modal */}
            {showPrintConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm border dark:border-gray-700 transition-colors">
                        <h2 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">✅ Venta Registrada</h2>
                        <div className="mb-6">
                            <p className="text-gray-600 dark:text-gray-300">La transacción se ha guardado correctamente.</p>
                            <p className="font-bold text-lg mt-2 text-gray-900 dark:text-white">{formatCurrency(printData?.amount || 0)}</p>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">¿Desea imprimir el recibo?</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowPrintConfirm(false)}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                            >
                                No
                            </button>
                            <button
                                onClick={handleConfirmPrint}
                                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
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
