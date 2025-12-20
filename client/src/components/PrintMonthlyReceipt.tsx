import React from 'react';

interface MonthlyReceiptProps {
    data: {
        paymentId: number;
        plate: string;
        clientName: string;
        vehicleType: string;
        amount: number;
        periodStart: string; // ISO date string
        periodEnd: string;   // ISO date string
        paymentDate: string; // ISO date string
        concept: string;     // 'Nueva Mensualidad' or 'Renovación'
    };
}

export const PrintMonthlyReceipt = React.forwardRef<HTMLDivElement, MonthlyReceiptProps>(
    ({ data }, ref) => {
        return (
            <div ref={ref} className="p-4 max-w-[80mm] mx-auto bg-white text-black font-sans">
                <style>
                    {`
                        @media print {
                            body { margin: 0; }
                            @page { size: 80mm auto; margin: 0; }
                        }
                    `}
                </style>

                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold">PARKINGSOF</h1>
                    <p className="text-xs uppercase">Estacionamiento & Lavadero</p>
                    <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
                    <h2 className="text-sm font-bold uppercase">{data.concept}</h2>
                </div>

                <div className="mb-4 text-sm">
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">RECIBO #:</span>
                        <span>{data.paymentId.toString().padStart(6, '0')}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">FECHA:</span>
                        <span>{new Date(data.paymentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">HORA:</span>
                        <span>{new Date(data.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                <div className="border-t border-gray-300 my-2"></div>

                <div className="mb-4 text-sm">
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">CLIENTE:</span>
                        <span className="text-right truncate max-w-[120px]">{data.clientName}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">PLACA:</span>
                        <span className="font-bold">{data.plate}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">TIPO:</span>
                        <span>{data.vehicleType}</span>
                    </div>

                    <div className="mt-2 mb-1 font-semibold text-center">PERIODO PAGADO</div>
                    <div className="text-center text-xs">
                        {new Date(data.periodStart).toLocaleDateString()} - {new Date(data.periodEnd).toLocaleDateString()}
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-400 my-2"></div>

                <div className="mb-4">
                    <div className="flex justify-between text-xl font-bold">
                        <span>TOTAL:</span>
                        <span>${data.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-center mt-1 text-gray-500">
                        (Pago Registrado)
                    </div>
                </div>

                <div className="text-center text-xs mt-6">
                    <p>¡Gracias por su confianza!</p>
                    <p className="mt-1">ParkingSof</p>
                </div>
            </div>
        );
    }
);

PrintMonthlyReceipt.displayName = 'PrintMonthlyReceipt';
