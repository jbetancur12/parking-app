import React from 'react';

interface PrintReceiptProps {
    session: {
        id: number;
        plate: string;
        vehicleType: string;
        entryTime: string;
        exitTime: string;
        planType: string;
        cost: number;
        duration: string;
        receiptNumber?: string;
        agreementName?: string;
        discount?: number;
    };
    settings?: any;
}

export const PrintReceipt = React.forwardRef<HTMLDivElement, PrintReceiptProps>(
    ({ session, settings }, ref) => {
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
                    className="font-mono text-black text-[10pt] leading-tight"
                >
                    {/* HEADER */}
                    <div className="text-center mb-2">
                        {logo && (
                            <img
                                src={logo}
                                alt="Logo"
                                style={{ maxWidth: '100%', maxHeight: '60px', margin: '0 auto 4px' }}
                            />
                        )}

                        <div className="font-bold text-base uppercase">
                            {settings?.company_name || 'CUADRA'}
                        </div>

                        {settings?.company_nit && <div>NIT: {settings.company_nit}</div>}
                        {settings?.company_address && <div>{settings.company_address}</div>}
                        {settings?.company_phone && <div>Tel: {settings.company_phone}</div>}

                        <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />
                        <div className="font-bold">RECIBO DE PAGO</div>
                    </div>

                    {/* DATOS */}
                    <div className="uppercase mb-2">
                        <p><b>RECIBO #:</b> {session.receiptNumber ?? session.id.toString().padStart(6, '0')}</p>
                        <p><b>PLACA:</b> {session.plate}</p>
                        <p><b>TIPO:</b> {session.vehicleType === 'CAR' ? 'CARRO' : session.vehicleType === 'MOTORCYCLE' ? 'MOTO' : 'OTRO'}</p>
                        <p><b>PLAN:</b> {session.planType === 'HOUR' ? 'POR HORA' : 'POR DIA'}</p>
                    </div>

                    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

                    {/* TIEMPOS */}
                    <div className="uppercase mb-2">
                        <p>
                            <b>ENTRADA:</b>{' '}
                            {new Date(session.entryTime).toLocaleString('es-CO', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                        <p>
                            <b>SALIDA:</b>{' '}
                            {new Date(session.exitTime).toLocaleString('es-CO', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                        <p><b>DURACIÓN:</b> {session.duration}</p>
                    </div>

                    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

                    {/* TOTALES */}
                    <div className="mb-2">
                        {session.agreementName && (
                            <p><b>CONVENIO:</b> {session.agreementName}</p>
                        )}

                        {session.discount && session.discount > 0 && (
                            <p><b>DESCUENTO:</b> -{session.discount.toLocaleString()}</p>
                        )}

                        <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

                        <p className="font-bold text-lg">
                            TOTAL: ${session.cost.toLocaleString()}
                        </p>
                    </div>

                    {/* FOOTER */}
                    <div className="text-center text-[9pt] mt-2">
                        <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />
                        <p className="font-bold">¡GRACIAS POR SU VISITA!</p>
                        <p className="text-[8pt] mt-1">Software: CUADRA</p>
                    </div>
                </div>
            </>
        );
    }
);

PrintReceipt.displayName = 'PrintReceipt';
