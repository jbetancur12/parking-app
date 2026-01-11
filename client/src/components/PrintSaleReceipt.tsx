import React from 'react';

interface PrintSaleReceiptProps {
    transaction: {
        id: number;
        timestamp: string;
        items?: {
            productId?: number;
            quantity: number;
            price?: number;
            productName?: string;
        }[];
        description: string;
        amount: number;
        paymentMethod: string;
        receiptNumber?: string;
    };
    settings?: any;
}

export const PrintSaleReceipt = React.forwardRef<HTMLDivElement, PrintSaleReceiptProps>(
    ({ transaction, settings }, ref) => {
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
                        <div className="font-bold">RECIBO DE CAJA</div>
                    </div>

                    {/* INFO */}
                    <div className="uppercase mb-2">
                        <p>
                            <b>RECIBO #:</b>{' '}
                            {transaction.receiptNumber ??
                                transaction.id.toString().padStart(6, '0')}
                        </p>
                        <p>
                            <b>FECHA:</b>{' '}
                            {new Date(transaction.timestamp).toLocaleDateString('es-CO')}
                        </p>
                        <p>
                            <b>HORA:</b>{' '}
                            {new Date(transaction.timestamp).toLocaleTimeString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                        <p>
                            <b>PAGO:</b>{' '}
                            {transaction.paymentMethod === 'TRANSFER'
                                ? 'TRANSFERENCIA'
                                : 'EFECTIVO'}
                        </p>
                    </div>

                    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

                    {/* ITEMS / DESCRIPCIÓN */}
                    <div className="uppercase mb-2">
                        {transaction.items && transaction.items.length > 0 ? (
                            <>
                                <p className="font-bold mb-1">DETALLE</p>

                                {transaction.items.map((item, idx) => (
                                    <div key={idx} style={{ marginBottom: '4px' }}>
                                        <div>{item.productName || 'Producto'}</div>
                                        <div className="text-[9pt]">
                                            CANT: {item.quantity}{' '}
                                            | TOTAL: $
                                            {((item.price || 0) * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="font-bold">{transaction.description}</p>
                        )}
                    </div>

                    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

                    {/* TOTAL */}
                    <div className="mb-2">
                        <p className="font-bold text-lg">
                            TOTAL: ${transaction.amount.toLocaleString()}
                        </p>
                    </div>

                    {/* FOOTER */}
                    <div className="text-center text-[9pt] mt-2">
                        <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />
                        <p className="font-bold">¡GRACIAS POR SU COMPRA!</p>
                        <p className="text-[8pt] mt-1">Software: CUADRA</p>
                    </div>
                </div>
            </>
        );
    }
);

PrintSaleReceipt.displayName = 'PrintSaleReceipt';
