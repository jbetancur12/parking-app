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
    };
    settings?: any;
}

export const PrintTicket = React.forwardRef<HTMLDivElement, PrintTicketProps>(
    ({ session, settings }, ref) => {
        // For 58mm, using '100%' is often safer than fixed '58mm' which can trigger horizontal scroll/cut-off
        // depending on the driver's unprintable margins.
        const is80mm = settings?.ticket_width === '80mm';
        const width = is80mm ? '80mm' : '100%';
        const showQr = settings?.enable_qr !== 'false';
        const logo = settings?.company_logo;

        // Filter valid regulations
        const regulations = [];
        for (let i = 1; i <= 6; i++) {
            const line = settings?.[`regulation_text_${i}`];
            if (line) regulations.push(line);
        }

        return (
            <div ref={ref} className="p-1 mx-auto bg-white text-black font-mono text-[10pt] leading-tight" style={{ width: width, maxWidth: is80mm ? '80mm' : '58mm' }}>
                <style>
                    {`
                        @media print {
                            body { margin: 0; }
                            @page { size: ${is80mm ? '80mm' : '58mm'} auto; margin: 0; }
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

                    <h1 className="text-xl font-bold uppercase">{settings?.company_name || 'APARCA'}</h1>
                    {settings?.company_nit && <p className="text-xs">NIT: {settings.company_nit}</p>}
                    {settings?.company_address && <p className="text-xs">{settings.company_address}</p>}
                    {settings?.company_phone && <p className="text-xs">Tel: {settings.company_phone}</p>}

                    <div className="border-t-2 border-dashed border-gray-800 my-2"></div>
                </div>

                {/* Session Info */}
                <div className="mb-2 uppercase">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">TICKET #:</span>
                        <span>{session.id.toString().padStart(6, '0')}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">PLACA:</span>
                        <span className="text-xl font-bold">{session.plate}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">TIPO:</span>
                        <span>{session.vehicleType === 'CAR' ? 'CARRO' : session.vehicleType === 'MOTORCYCLE' ? 'MOTO' : 'OTRO'}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">PLAN:</span>
                        <span>{session.planType === 'HOUR' ? 'POR HORA' : 'POR DIA'}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">INGRESO:</span>
                        <span>{new Date(session.entryTime).toLocaleString('es-CO', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                {/* QR Code */}
                {showQr && (
                    <div className="flex justify-center my-2">
                        <QRCodeSVG value={`${window.location.origin}/ticket/${session.id}`} size={is80mm ? 120 : 100} />
                    </div>
                )}

                {/* Barcode (Plate) for Legacy Scanners */}
                <div className="flex justify-center mb-2 overflow-hidden">
                    <Barcode
                        value={session.plate}
                        format="CODE128"
                        width={is80mm ? 1.5 : 0.9} // Reduced to 0.9 for 58mm to ensure fit
                        height={40}
                        fontSize={12}
                        displayValue={true}
                        background="transparent"
                        margin={0}
                    />
                </div>

                {/* Footer / Regulations */}
                <div className="text-center text-[8pt] mt-2">
                    <div className="border-t-2 border-dashed border-gray-800 my-2"></div>

                    {regulations.length > 0 ? (
                        <div className="space-y-1 mb-2">
                            {regulations.map((line, idx) => (
                                <p key={idx}>{line}</p>
                            ))}
                        </div>
                    ) : (
                        <>
                            <p>CONSERVE ESTE TICKET</p>
                            <p>Necesario para la salida</p>
                        </>
                    )}

                    <p className="mt-2 font-bold">¡Gracias por su visita!</p>
                    <p className="text-[7pt] mt-1 text-gray-500">Software: APARCA</p>
                </div>
            </div>
        );
    }
);

PrintTicket.displayName = 'PrintTicket';
