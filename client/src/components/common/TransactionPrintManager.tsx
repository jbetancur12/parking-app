import React, { useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface TransactionPrintManagerProps {
    printData: any; // Using any for now to support both Wash and Income data structures, or allow generic
    showConfirm: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    receiptRef: React.RefObject<any>;
    ReceiptComponent: React.ComponentType<any>;
    settings?: any;
    title?: string;
    successMessage?: string;
}

export const TransactionPrintManager: React.FC<TransactionPrintManagerProps> = ({
    printData,
    showConfirm,
    onCancel,
    onConfirm,
    receiptRef,
    ReceiptComponent,
    settings,
    title = '✅ Transacción Exitosa',
    successMessage = 'El registro se ha guardado correctamente.'
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showConfirm && e.key === 'Escape') {
                onCancel();
            }
        };

        if (showConfirm) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showConfirm, onCancel]);

    return (
        <>
            {/* Hidden Print Receipt */}
            <div style={{ display: 'none' }}>
                {printData && (
                    <ReceiptComponent
                        ref={receiptRef}
                        transaction={printData}
                        settings={settings}
                    />
                )}
            </div>

            {/* Print Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm shadow-xl border dark:border-gray-700 transition-colors">
                        <h2 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">{title}</h2>
                        <div className="mb-6">
                            <p className="text-gray-600 dark:text-gray-300">{successMessage}</p>
                            <p className="font-bold text-lg mt-2 text-gray-900 dark:text-white">
                                {formatCurrency(printData?.amount || printData?.total || 0)}
                            </p>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">¿Desea imprimir el recibo?</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                            >
                                No
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 bg-brand-blue text-white py-2 rounded hover:bg-blue-700 font-medium"
                            >
                                🖨️ Sí, Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
