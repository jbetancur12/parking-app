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
        // Ajustes dinámicos según el ancho del rollo
        const width = settings?.ticket_width === '80mm' ? '576px' : '384px';
        const fontSize = settings?.ticket_width === '80mm' ? '14px' : '12px';

        const logo = settings?.company_logo;

        return (
            <div
                ref={ref}
                className="p-2 mx-auto bg-white text-red-500 font-mono leading-tight border border-dashed border-gray-800 bg-[#f9f9f9]"
                style={{ width, fontSize }}
            >
                <style>
                    {`
                        @media print {
                            body { margin: 0; }
                            @page { size: auto; margin: 0; }
                        }
                    `}
                </style>

                {/* Header */}
                <div className="text-center mb-2">
                    {logo && (
                        <div className="flex justify-center mb-2">
                            <img
                                src={logo}
                                alt="Logo"
                                style={{ maxHeight: '60px', maxWidth: '100%' }}
                            />
                        </div>
                    )}

                    <h1 className="text-xl font-bold uppercase">
                        {settings?.company_name || 'CUADRA'}
                    </h1>
                    {settings?.company_nit && (
                        <p className="text-xs">NIT: {settings.company_nit}</p>
                    )}
                    {settings?.company_address && (
                        <p className="text-xs">{settings.company_address}</p>
                    )}
                    {settings?.company_phone && (
                        <p className="text-xs">Tel: {settings.company_phone}</p>
                    )}

                    <div className="border-t-2 border-dashed border-gray-800 my-2"></div>
                    <p className="font-bold">RECIBO DE PAGO</p>
                </div>

                {/* Datos principales */}
                <div className="mb-2 uppercase">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">RECIBO #:</span>
                        <span>
                            {session.receiptNumber ||
                                (session.id
                                    ? session.id.toString().padStart(6, '0')
                                    : 'N/A')}
                        </span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">PLACA:</span>
                        <span className="text-xl font-bold">{session.plate}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">TIPO:</span>
                        <span>
                            {session.vehicleType === 'CAR'
                                ? 'CARRO'
                                : session.vehicleType === 'MOTORCYCLE'
                                    ? 'MOTO'
                                    : 'OTRO'}
                        </span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">PLAN:</span>
                        <span>
                            {session.planType === 'HOUR' ? 'POR HORA' : 'POR DIA'}
                        </span>
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-800 my-2"></div>

                {/* Tiempos */}
                <div className="mb-2 uppercase">
                    <div className="flex justify-between mb-1">
                        <span>ENTRADA:</span>
                        <span>
                            {new Date(session.entryTime).toLocaleString('es-CO', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>SALIDA:</span>
                        <span>
                            {new Date(session.exitTime).toLocaleString('es-CO', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>
                    <div className="flex justify-between mb-1 font-bold">
                        <span>DURACIÓN:</span>
                        <span>{session.duration}</span>
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-800 my-2"></div>

                {/* Totales */}
                <div className="mb-2">
                    {session.agreementName && (
                        <div className="flex justify-between mb-1 text-sm">
                            <span className="font-bold">CONVENIO:</span>
                            <span className="text-right truncate ml-2">
                                {session.agreementName}
                            </span>
                        </div>
                    )}
                    {session.discount && session.discount > 0 && (
                        <div className="flex justify-between mb-1 text-sm">
                            <span className="font-bold">DESCUENTO:</span>
                            <span>-{session.discount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xl font-bold border-t-2 border-dashed border-gray-800 pt-1 mt-1">
                        <span>TOTAL:</span>
                        <span>${session.cost.toLocaleString()}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[8pt] mt-4">
                    <div className="border-t-2 border-dashed border-gray-800 my-2"></div>
                    <p className="font-bold">¡GRACIAS POR SU VISITA!</p>
                    <p className="mt-1 text-gray-500">Software: CUADRA</p>
                </div>
            </div>
        );
    }
);

PrintReceipt.displayName = 'PrintReceipt';