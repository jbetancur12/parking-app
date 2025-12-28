import React from 'react';

interface PrintSaleReceiptProps {
    transaction: {
        id: number;
        timestamp: string;
        items?: { productId?: number; quantity: number; price?: number; productName?: string }[];
        description: string;
        amount: number;
        paymentMethod: string;
    };
    settings?: any;
}

export const PrintSaleReceipt = React.forwardRef<HTMLDivElement, PrintSaleReceiptProps>(
    ({ transaction, settings }, ref) => {
        const width = settings?.ticket_width === '80mm' ? '80mm' : '58mm';
        const logo = settings?.company_logo;

        // Parse description if items are missing but description contains details? 
        // Ideally backend or parent component provides items. 
        // For POS, we will pass items. For Manual, we trust description.

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
                    <p className="font-bold">RECIBO DE CAJA</p>
                </div>

                <div className="mb-2 uppercase">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">RECIBO #:</span>
                        <span>{transaction.id ? transaction.id.toString().padStart(6, '0') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">FECHA:</span>
                        <span>{new Date(transaction.timestamp).toLocaleDateString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">HORA:</span>
                        <span>{new Date(transaction.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold">PAGO:</span>
                        <span>{transaction.paymentMethod === 'TRANSFER' ? 'TRANSFERENCIA' : 'EFECTIVO'}</span>
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-800 my-2"></div>

                {/* Items or Description */}
                <div className="mb-2 uppercase text-xs">
                    {(transaction.items && transaction.items.length > 0) ? (
                        <>
                            <div className="flex font-bold border-b border-gray-300 pb-1 mb-1">
                                <span className="flex-1">ITEM</span>
                                <span className="w-8 text-center">CANT</span>
                                <span className="w-16 text-right">TOTAL</span>
                            </div>
                            {transaction.items.map((item, idx) => (
                                <div key={idx} className="flex mb-1">
                                    <span className="flex-1 truncate pr-1">{item.productName || 'Producto'}</span>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <span className="w-16 text-right">
                                        ${((item.price || 0) * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="font-bold mb-1">
                            {transaction.description}
                        </div>
                    )}
                </div>

                <div className="border-t-2 border-dashed border-gray-800 my-2"></div>

                <div className="mb-2">
                    <div className="flex justify-between text-xl font-bold">
                        <span>TOTAL:</span>
                        <span>${transaction.amount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="text-center text-[8pt] mt-4">
                    <div className="border-t-2 border-dashed border-gray-800 my-2"></div>
                    <p className="font-bold">¡GRACIAS POR SU COMPRA!</p>
                </div>
            </div>
        );
    }
);

PrintSaleReceipt.displayName = 'PrintSaleReceipt';
