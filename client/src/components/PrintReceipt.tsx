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
    };
}

export const PrintReceipt = React.forwardRef<HTMLDivElement, PrintReceiptProps>(
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
                    <p className="text-xs">Recibo de Pago</p>
                    <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">RECIBO #:</span>
                        <span>{session.id ? session.id.toString().padStart(6, '0') : 'N/A'}</span>
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
                </div>

                <div className="border-t-2 border-gray-300 my-2"></div>

                <div className="mb-4">
                    <div className="flex justify-between mb-1 text-sm">
                        <span>Entrada:</span>
                        <span>{new Date(session.entryTime).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-1 text-sm">
                        <span>Salida:</span>
                        <span>{new Date(session.exitTime).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-1 font-semibold">
                        <span>Duración:</span>
                        <span>{session.duration}</span>
                    </div>
                </div>

                <div className="border-t-2 border-gray-300 my-2"></div>

                <div className="mb-4">
                    <div className="flex justify-between text-2xl font-bold">
                        <span>TOTAL:</span>
                        <span>${session.cost.toLocaleString()}</span>
                    </div>
                </div>

                <div className="text-center text-xs mt-4">
                    <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
                    <p className="font-semibold">GRACIAS POR SU VISITA</p>
                    <p className="mt-2 text-gray-600">Vuelva pronto</p>
                </div>
            </div>
        );
    }
);

PrintReceipt.displayName = 'PrintReceipt';
