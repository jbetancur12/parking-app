import React from 'react';
import QRCode from 'qrcode.react';

interface PrintTicketProps {
    session: {
        id: number;
        plate: string;
        vehicleType: string;
        entryTime: string;
        planType: string;
    };
}

export const PrintTicket = React.forwardRef<HTMLDivElement, PrintTicketProps>(
    ({ session }, ref) => {
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
                    <p className="text-xs">Sistema de Parqueadero</p>
                    <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">TICKET #:</span>
                        <span>{session.id.toString().padStart(6, '0')}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">PLACA:</span>
                        <span className="text-lg font-bold">{session.plate}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">TIPO:</span>
                        <span>{session.vehicleType}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">PLAN:</span>
                        <span>{session.planType === 'HOUR' ? 'Por Hora' : 'Por Día'}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">ENTRADA:</span>
                        <span>{new Date(session.entryTime).toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex justify-center my-4">
                    <QRCode value={`PARKING-${session.id}`} size={128} />
                </div>

                <div className="text-center text-xs mt-4">
                    <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
                    <p>CONSERVE ESTE TICKET</p>
                    <p>Necesario para la salida</p>
                    <p className="mt-2 text-gray-600">Gracias por su preferencia</p>
                </div>
            </div>
        );
    }
);

PrintTicket.displayName = 'PrintTicket';
