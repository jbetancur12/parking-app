import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';

interface PrintTicketProps {
    session: {
        id: number;
        plate: string;
        vehicleType: string;
        entryTime: string;
        planType: string;
        ticketNumber?: string;
    };
    settings?: any;
}

export const PrintTicket = React.forwardRef<HTMLDivElement, PrintTicketProps>(
    ({ session, settings }, ref) => {
        const showQr = settings?.enable_qr !== 'false';
        const logo = settings?.company_logo;

        const regulations: string[] = [];
        for (let i = 1; i <= 6; i++) {
            const line = settings?.[`regulation_text_${i}`];

            if (line) {
                // Smart wrap: split by words and build lines max 35 chars
                const words = line.split(' ');
                let currentLine = '';

                words.forEach((word: string) => {
                    if ((currentLine + word).length <= 33) {
                        currentLine += (currentLine ? ' ' : '') + word;
                    } else {
                        if (currentLine) regulations.push(currentLine);
                        currentLine = word;
                    }
                });
                if (currentLine) regulations.push(currentLine);
            }
        }

        return (
            <>
                <style>
                    {`
            @media print {
              @page {
                margin: 0;
              }

            html, body {
                margin: 0;
                padding: 0;
                background: white !important;
                color: black !important;
                height: auto !important;   /* 🔥 */
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
                        backgroundColor: '#fff',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid'
                    }}
                    className="bg-white text-black font-mono text-[9pt] leading-tight"
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

                        {settings?.company_nit && <div className="text-[10pt]">NIT: {settings.company_nit}</div>}
                        {settings?.company_address && <div className="text-[10pt]">{settings.company_address}</div>}
                        {settings?.company_phone && <div className="text-[10pt]">Tel: {settings.company_phone}</div>}

                        <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />
                    </div>

                    {/* INFO */}
                    <div className="uppercase mb-2">
                        <p><b>TICKET #:</b> {session.ticketNumber?.padStart(4, '0') ?? session.id.toString().padStart(6, '0')}</p>
                        <p><b>PLACA:</b> {session.plate}</p>
                        <p><b>TIPO:</b> {session.vehicleType === 'CAR' ? 'CARRO' : session.vehicleType === 'MOTORCYCLE' ? 'MOTO' : 'OTRO'}</p>
                        <p><b>PLAN:</b> {session.planType === 'HOUR' ? 'POR HORA' : 'POR DIA'}</p>
                        <p>
                            <b>INGRESO:</b>{' '}
                            {new Date(session.entryTime).toLocaleString('es-CO', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>

                    {/* QR */}
                    {showQr && (
                        <div className="flex justify-center my-2">
                            <QRCodeSVG
                                value={`${window.location.origin}/ticket/${session.id}`}
                                size={90}
                            />
                        </div>
                    )}

                    {/* BARCODE */}
                    <div className="flex justify-center my-2">
                        <Barcode
                            value={session.plate}
                            format="CODE128"
                            width={2}
                            height={50}
                            fontSize={10}
                            displayValue
                            margin={0}
                        />
                    </div>

                    {/* FOOTER */}
                    <div className="text-center text-[10pt] mt-2">
                        <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

                        {regulations.length > 0 ? (
                            regulations.map((line, i) => (
                                <p
                                    key={i}
                                    style={{
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        margin: '0',
                                        padding: '0',
                                        textAlign: 'center', // Force left align for regulations
                                        width: '100%'
                                    }}
                                >
                                    {line}
                                </p>
                            ))
                        ) : (
                            <>
                                <p>CONSERVE ESTE TICKET</p>
                                <p>Necesario para la salida</p>
                            </>
                        )}

                        <p className="font-bold mt-2">¡Gracias por su visita!</p>
                        <p className="text-[8pt] mt-1">Software: CUADRA</p>
                    </div>
                </div>
            </>
        );
    }
);

PrintTicket.displayName = 'PrintTicket';
