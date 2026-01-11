import React from 'react';

interface MonthlyReceiptProps {
    data: {
        paymentId: number;
        plate: string;
        clientName: string;
        vehicleType: string;
        amount: number;
        periodStart: string;
        periodEnd: string;
        paymentDate: string;
        concept: string;
        receiptNumber?: string;
    };
    settings?: any;
}

export const PrintMonthlyReceipt = React.forwardRef<HTMLDivElement, MonthlyReceiptProps>(
    ({ data, settings }, ref) => {
        const logo = settings?.company_logo;

        const regulations: string[] = [];
        for (let i = 1; i <= 6; i++) {
            const line = settings?.[`regulation_text_${i}`];
            if (line) regulations.push(line);
        }

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
                        <div className="font-bold uppercase">{data.concept}</div>
                    </div>

                    {/* INFO */}
                    <div className="uppercase mb-2">
                        <p>
                            <b>RECIBO #:</b>{' '}
                            {data.receiptNumber ??
                                data.paymentId.toString().padStart(6, '0')}
                        </p>
                        <p>
                            <b>FECHA:</b>{' '}
                            {new Date(data.paymentDate).toLocaleDateString('es-CO')}
                        </p>
                        <p>
                            <b>HORA:</b>{' '}
                            {new Date(data.paymentDate).toLocaleTimeString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>

                    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

                    {/* CLIENTE / VEHÍCULO */}
                    <div className="uppercase mb-2">
                        <p>
                            <b>CLIENTE:</b> {data.clientName}
                        </p>
                        <p className="font-bold text-[11pt]">
                            PLACA: {data.plate}
                        </p>
                        <p>
                            <b>TIPO:</b> {data.vehicleType}
                        </p>

                        <div className="font-bold text-center mt-2">
                            PERIODO PAGADO
                        </div>
                        <div className="text-center text-[9pt]">
                            {new Date(data.periodStart).toLocaleDateString()} —{' '}
                            {new Date(data.periodEnd).toLocaleDateString()}
                        </div>
                    </div>

                    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

                    {/* TOTAL */}
                    <div className="mb-2">
                        <p className="font-bold text-lg">
                            TOTAL: ${data.amount.toLocaleString()}
                        </p>
                    </div>

                    {/* FOOTER */}
                    <div className="text-center text-[9pt] mt-2">
                        <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

                        {regulations.length > 0 ? (
                            regulations.map((line, idx) => (
                                <p key={idx}>{line}</p>
                            ))
                        ) : (
                            <p className="font-bold">¡GRACIAS POR SU CONFIANZA!</p>
                        )}

                        <div className="text-[7pt] mt-2 leading-tight text-justify">
                            Al pagar este recibo, usted acepta los términos del servicio
                            y autoriza el tratamiento de sus datos personales conforme a
                            la Ley 1581 de 2012 (Habeas Data).
                        </div>

                        <p className="text-[7pt] mt-1">Software: CUADRA</p>
                    </div>
                </div>
            </>
        );
    }
);

PrintMonthlyReceipt.displayName = 'PrintMonthlyReceipt';
