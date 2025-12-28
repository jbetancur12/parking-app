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
        cashIncome?: number;
        transferIncome?: number;
    };
    shift: {
        startTime: string;
        endTime: string;
    };
    user: {
        username: string;
    };
    settings?: any;
}

export const PrintShiftSummary = React.forwardRef<HTMLDivElement, PrintShiftSummaryProps>(
    ({ summary, shift, user, settings }, ref) => {
        const width = settings?.ticket_width === '80mm' ? '80mm' : '58mm';
        const logo = settings?.company_logo;

        // Filter valid regulations
        const regulations = [];
        for (let i = 1; i <= 6; i++) {
            const line = settings?.[`regulation_text_${i}`];
            if (line) regulations.push(line);
        }

        return (
            <div ref={ref} className="p-2 mx-auto bg-white text-black font-mono text-[10pt] leading-tight" style={{ width: width, maxWidth: width }}>
                <style>
                    {`
                        @media print {
                            body { margin: 0; }
                            @page { size: ${width} auto; margin: 0; }
                        }
                    `}
                </style>

                {/* Header */}
                <div className="text-center mb-2">
                    {logo && (
                        <div className="flex justify-center mb-2">
                            <img src={logo} alt="Logo" style={{ maxHeight: '60px', maxWidth: '100%' }} />
                        </div>
                    )}
                    <h1 className="text-xl font-bold uppercase">{settings?.company_name || 'CUADRA'}</h1>
                    {settings?.company_nit && <p className="text-xs">NIT: {settings.company_nit}</p>}
                    {settings?.company_address && <p className="text-xs">{settings.company_address}</p>}
                    {settings?.company_phone && <p className="text-xs">Tel: {settings.company_phone}</p>}

                    <div className="border-t-2 border-dashed border-gray-800 my-2"></div>
                    <h2 className="text-sm font-bold uppercase">CIERRE DE TURNO</h2>
                </div>

                <div className="mb-2 text-[9pt] uppercase">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">USUARIO:</span>
                        <span>{user.username}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">INICIO:</span>
                        <span>{new Date(shift.startTime).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">CIERRE:</span>
                        <span>{new Date(shift.endTime).toLocaleString('es-CO')}</span>
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-800 my-2"></div>

                <div className="mb-2 text-[9pt]">
                    <div className="flex justify-between mb-2">
                        <span>Base Inicial:</span>
                        <span className="font-bold">${summary.baseAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between mb-2">
                        <span>(+) Ingresos Totales:</span>
                        <span className="font-bold">${summary.totalIncome.toLocaleString()}</span>
                    </div>

                    {/* Income Breakdown */}
                    {(summary.cashIncome !== undefined || summary.transferIncome !== undefined) && (
                        <div className="ml-2 mb-2 text-[8pt] text-gray-600">
                            {summary.cashIncome !== undefined && (
                                <div className="flex justify-between">
                                    <span>- Efectivo:</span>
                                    <span>${summary.cashIncome.toLocaleString()}</span>
                                </div>
                            )}
                            {summary.transferIncome !== undefined && (
                                <div className="flex justify-between">
                                    <span>- Transferencia:</span>
                                    <span>${summary.transferIncome.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between mb-2">
                        <span>(-) Egresos:</span>
                        <span className="font-bold">${summary.totalExpenses.toLocaleString()}</span>
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-800 my-2"></div>

                <div className="mb-2 text-[10pt]">
                    <div className="flex justify-between mb-2 font-bold">
                        <span>ESPERADO:</span>
                        <span>${summary.expectedCash.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2 font-bold">
                        <span>DECLARADO:</span>
                        <span>${summary.declaredAmount.toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between text-lg font-bold ${summary.difference >= 0 ? 'text-black' : 'text-black'}`}>
                        <span>DIFERENCIA:</span>
                        <span>${summary.difference.toLocaleString()}</span>
                    </div>
                    <p className="text-center text-[8pt] uppercase mt-1">
                        {summary.difference >= 0 ? '(SOBRANTE)' : '(FALTANTE)'}
                    </p>
                </div>

                <div className="border-t-2 border-dashed border-gray-800 my-2"></div>

                <div className="text-center text-[9pt] mb-2 uppercase">
                    <p>TRANSACCIONES TOTALES: <strong>{summary.transactionCount}</strong></p>
                </div>

                <div className="text-center text-[7pt] mt-4 uppercase">
                    <div className="border-t-2 border-dashed border-gray-800 my-2"></div>
                    <p className="font-bold">Firma Cajero</p>
                    <br />
                    <div className="border-b border-black w-2/3 mx-auto my-2"></div>

                    <p className="mt-2 text-gray-500">Impreso: {new Date().toLocaleString('es-CO')}</p>
                    <p>Software: CUADRA</p>
                </div>
            </div>
        );
    }
);

PrintShiftSummary.displayName = 'PrintShiftSummary';
