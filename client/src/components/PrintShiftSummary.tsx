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

export const PrintShiftSummary = React.forwardRef<
    HTMLDivElement,
    PrintShiftSummaryProps
>(({ summary, shift, user, settings }, ref) => {
    const logo = settings?.company_logo;

    return (
        <>
            <style>
                {`
          @media print {
            @page { margin: 0; }

            html, body {
              margin: 0;
              padding: 0;
              background: white !important;
              color: black !important;
              height: auto !important;
            }

            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
            </style>

            <div
                ref={ref}
                style={{
                    width: '100%',
                    padding: '4px',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                }}
                className="font-mono text-black text-[12pt] leading-tight"
            >
                {/* HEADER */}
                <div className="text-center mb-2">
                    {logo && (
                        <img
                            src={logo}
                            alt="Logo"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '60px',
                                margin: '0 auto 4px',
                            }}
                        />
                    )}

                    <div className="font-bold text-base uppercase">
                        {settings?.company_name || 'CUADRA'}
                    </div>

                    {settings?.company_nit && <div>NIT: {settings.company_nit}</div>}
                    {settings?.company_address && <div>{settings.company_address}</div>}
                    {settings?.company_phone && <div>Tel: {settings.company_phone}</div>}

                    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />
                    <div className="font-bold uppercase">CIERRE DE TURNO</div>
                </div>

                {/* INFO */}
                <div className="uppercase mb-2">
                    <p>
                        <b>USUARIO:</b> {user.username}
                    </p>
                    <p>
                        <b>INICIO:</b>{' '}
                        {new Date(shift.startTime).toLocaleString('es-CO')}
                    </p>
                    <p>
                        <b>CIERRE:</b>{' '}
                        {new Date(shift.endTime).toLocaleString('es-CO')}
                    </p>
                </div>

                <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

                {/* MOVIMIENTOS */}
                <div className="mb-2">
                    <p>
                        Base Inicial: <b>${summary.baseAmount.toLocaleString()}</b>
                    </p>

                    <p>
                        (+) Ingresos Totales:{' '}
                        <b>${summary.totalIncome.toLocaleString()}</b>
                    </p>

                    {summary.cashIncome !== undefined && (
                        <p className="ml-2 text-[12pt] text-black-700">
                            - Efectivo: ${summary.cashIncome.toLocaleString()}
                        </p>
                    )}

                    {summary.transferIncome !== undefined && (
                        <p className="ml-2 text-[12pt] text-black-700">
                            - Transferencia: ${summary.transferIncome.toLocaleString()}
                        </p>
                    )}

                    <p>
                        (-) Egresos:{' '}
                        <b>${summary.totalExpenses.toLocaleString()}</b>
                    </p>
                </div>

                <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

                {/* TOTALES */}
                <div className="mb-2">
                    <p>
                        <b>ESPERADO:</b> ${summary.expectedCash.toLocaleString()}
                    </p>
                    <p>
                        <b>DECLARADO:</b> ${summary.declaredAmount.toLocaleString()}
                    </p>
                    <p className="font-bold text-lg">
                        DIFERENCIA: ${summary.difference.toLocaleString()}
                    </p>
                    <p className="text-center text-[10pt] uppercase">
                        {summary.difference >= 0 ? '(SOBRANTE)' : '(FALTANTE)'}
                    </p>
                </div>

                <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

                {/* FOOTER */}
                <div className="text-center text-[10pt] uppercase mb-2">
                    <p>
                        TRANSACCIONES TOTALES:{' '}
                        <b>{summary.transactionCount}</b>
                    </p>
                </div>

                <div className="text-center text-[8pt] mt-3 uppercase">
                    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />
                    <p className="font-bold">Firma Cajero</p>
                    <div
                        style={{
                            borderBottom: '1px solid #000',
                            width: '70%',
                            margin: '10px auto',
                        }}
                    />
                    <p className="text-black-500">
                        Impreso: {new Date().toLocaleString('es-CO')}
                    </p>
                    <p>Software: CUADRA</p>
                </div>
            </div>
        </>
    );
});

PrintShiftSummary.displayName = 'PrintShiftSummary';
