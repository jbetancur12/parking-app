import React from 'react';

interface ShiftSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    summaryData: any;
    onPrint: () => void;
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({
    isOpen,
    onClose,
    summaryData,
    onPrint
}) => {
    if (!isOpen || !summaryData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-green-600">✅ Turno Cerrado</h2>

                <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Base Inicial:</span>
                        <span className="font-semibold">${summaryData.baseAmount?.toLocaleString()}</span>
                    </div>

                    {summaryData.cashIncome !== undefined && (
                        <>
                            <div className="flex justify-between text-green-600">
                                <span>💵 Ingresos Efectivo:</span>
                                <span className="font-semibold">${summaryData.cashIncome?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-blue-600">
                                <span>🏦 Ingresos Transferencia:</span>
                                <span className="font-semibold">${summaryData.transferIncome?.toLocaleString()}</span>
                            </div>
                        </>
                    )}

                    <div className="flex justify-between text-green-600">
                        <span>Total Ingresos:</span>
                        <span className="font-semibold">${summaryData.totalIncome?.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-red-600">
                        <span>Total Egresos:</span>
                        <span className="font-semibold">-${summaryData.totalExpenses?.toLocaleString()}</span>
                    </div>

                    <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between font-bold">
                            <span>Efectivo Esperado:</span>
                            <span className="text-blue-600">${summaryData.expectedCash?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Efectivo Declarado:</span>
                            <span className="text-purple-600">${summaryData.declaredAmount?.toLocaleString()}</span>
                        </div>
                        <div className={`flex justify-between font-bold text-lg ${summaryData.difference >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            <span>Diferencia:</span>
                            <span>
                                {summaryData.difference >= 0 ? '+' : ''}${summaryData.difference?.toLocaleString()}
                                {summaryData.difference >= 0 ? ' (Sobrante)' : ' (Faltante)'}
                            </span>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500 text-center pt-2">
                        {summaryData.transactionCount} transacciones
                    </div>
                </div>

                <p className="text-gray-600 mb-4 text-center">¿Desea imprimir el resumen del turno?</p>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
                    >
                        No, gracias
                    </button>
                    <button
                        onClick={onPrint}
                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                    >
                        🖨️ Sí, Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
};
