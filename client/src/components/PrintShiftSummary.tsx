import React from 'react';

interface PrintShiftSummaryProps {
    summary: {
        baseAmount: number;
        totalIncome: number;
        totalExpenses: number;
        expectedCash: number;
        declaredAmount: number;
        difference: number;
        transactionCount: number;
    };
    shift: {
        startTime: string;
        endTime: string;
    };
    user: {
        username: string;
    };
}

export const PrintShiftSummary = React.forwardRef<HTMLDivElement, PrintShiftSummaryProps>(
    ({ summary, shift, user }, ref) => {
        return (
            <div ref={ref} className="p-4 max-w-[80mm] mx-auto bg-white text-black">
                <style>
                    {`
                        @media print {
                            body { margin: 0; }
                            @page { size: 80mm auto; margin: 0; }
                        }
                    `}
                </style>

                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold">PARKINGSOF</h1>
                    <p className="text-xs">Cierre de Turno</p>
                    <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
                </div>

                <div className="mb-4 text-sm">
                    <div className="flex justify-between mb-1">
                        <span>Usuario:</span>
                        <span className="font-semibold">{user.username}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>Inicio:</span>
                        <span>{new Date(shift.startTime).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>Cierre:</span>
                        <span>{new Date(shift.endTime).toLocaleString()}</span>
                    </div>
                </div>

                <div className="border-t-2 border-gray-300 my-3"></div>

                <div className="mb-4">
                    <div className="flex justify-between mb-2">
                        <span>Base Inicial:</span>
                        <span className="font-semibold">${summary.baseAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-green-700">
                        <span>+ Ingresos:</span>
                        <span className="font-semibold">${summary.totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-red-700">
                        <span>- Egresos:</span>
                        <span className="font-semibold">${summary.totalExpenses.toLocaleString()}</span>
                    </div>
                </div>

                <div className="border-t-2 border-gray-300 my-3"></div>

                <div className="mb-4">
                    <div className="flex justify-between mb-2 text-lg font-bold">
                        <span>Esperado:</span>
                        <span>${summary.expectedCash.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-lg font-bold">
                        <span>Declarado:</span>
                        <span>${summary.declaredAmount.toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between text-xl font-bold ${summary.difference >= 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                        <span>Diferencia:</span>
                        <span>${summary.difference.toLocaleString()}</span>
                    </div>
                    <p className="text-center text-xs mt-1">
                        {summary.difference >= 0 ? '(Sobrante)' : '(Faltante)'}
                    </p>
                </div>

                <div className="border-t-2 border-gray-300 my-3"></div>

                <div className="text-center text-sm mb-4">
                    <p>Total de Transacciones: <strong>{summary.transactionCount}</strong></p>
                </div>

                <div className="text-center text-xs mt-4">
                    <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
                    <p className="font-semibold">GRACIAS</p>
                    <p className="mt-1 text-gray-600">
                        {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
                    </p>
                </div>
            </div>
        );
    }
);

PrintShiftSummary.displayName = 'PrintShiftSummary';
