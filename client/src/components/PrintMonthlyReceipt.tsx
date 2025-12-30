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
    settings?: any;
}

export const PrintMonthlyReceipt = React.forwardRef<HTMLDivElement, MonthlyReceiptProps>(
    ({ data, settings }, ref) => {
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
                    <h2 className="text-sm font-bold uppercase">{data.concept}</h2>
                </div>

                <div className="mb-2 text-[9pt] uppercase">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">RECIBO #:</span>
                        <span>{data.paymentId.toString().padStart(6, '0')}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">FECHA:</span>
                        <span>{new Date(data.paymentDate).toLocaleDateString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">HORA:</span>
                        <span>{new Date(data.paymentDate).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                <div className="border-t border-dashed border-gray-800 my-2"></div>

                <div className="mb-2 text-[9pt] uppercase">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">CLIENTE:</span>
                        <span className="text-right truncate max-w-[120px]">{data.clientName}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">PLACA:</span>
                        <span className="font-bold text-[11pt]">{data.plate}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">TIPO:</span>
                        <span>{data.vehicleType}</span>
                    </div>

                    <div className="mt-2 mb-1 font-bold text-center">PERIODO PAGADO</div>
                    <div className="text-center text-[9pt]">
                        {new Date(data.periodStart).toLocaleDateString()} - {new Date(data.periodEnd).toLocaleDateString()}
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-800 my-2"></div>

                <div className="mb-4">
                    <div className="flex justify-between text-xl font-bold">
                        <span>TOTAL:</span>
                        <span>${data.amount.toLocaleString()}</span>
                    </div>
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
                        <p className="font-bold">¡GRACIAS POR SU CONFIANZA!</p>
                    )}

                    <div className="mt-2 text-[6pt] text-gray-500 text-justify leading-tight">
                        Al pagar este recibo, usted acepta los términos del servicio y autoriza el tratamiento de sus datos personales conforme a la Ley 1581 de 2012 (Habeas Data).
                    </div>

                    <p className="text-[7pt] mt-1 text-gray-500">Software: CUADRA</p>
                </div>
            </div>
        );
    }
);

PrintMonthlyReceipt.displayName = 'PrintMonthlyReceipt';
