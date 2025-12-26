import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Package, ShoppingCart, Trash, Printer } from 'lucide-react';
import { saleService } from '../services/sale.service';
import { productService, type Product } from '../services/product.service';
import { settingService } from '../services/setting.service';
import api from '../services/api';
import { useElectronPrint } from '../hooks/useElectronPrint';
import { PrintSaleReceipt } from '../components/PrintSaleReceipt';
import { toast } from 'sonner';

interface CartItem {
    product: Product;
    quantity: number;
}

export default function IncomesPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeShift, setActiveShift] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);

    // Modes: 'MANUAL' | 'POS'
    const [mode, setMode] = useState<'MANUAL' | 'POS'>('POS');

    // Manual Form
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');

    // POS Data
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);

    // Printing
    const receiptRef = useRef<HTMLDivElement>(null);
    const [printData, setPrintData] = useState<any>(null);
    const [showPrintConfirm, setShowPrintConfirm] = useState(false);

    const handlePrintReceipt = useElectronPrint({
        contentRef: receiptRef,
        silent: settings?.show_print_dialog === 'false'
    });

    useEffect(() => {
        fetchActiveShift();
        loadProducts();
        fetchSettings();
    }, []);

    useEffect(() => {
        if (activeShift) {
            fetchTransactions();
        }
    }, [activeShift]);

    const fetchSettings = async () => {
        try {
            const data = await settingService.getAll();
            setSettings(data);
        } catch (error) {
            console.error('Error loading settings', error);
        }
    };

    const fetchActiveShift = async () => {
        try {
            const response = await api.get('/shifts/current');
            setActiveShift(response.data);
        } catch (err) {
            setActiveShift(null);
        }
    };

    const fetchTransactions = async () => {
        if (!activeShift) return;
        try {
            const data = await saleService.getAllByShift(activeShift.id);
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions');
        }
    };

    const loadProducts = async () => {
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products');
        }
    };

    const addToCart = (product: Product) => {
        if (product.stock <= 0) return;

        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                // Check stock limit
                if (existing.quantity >= product.stock) {
                    toast.warning(`Stock insuficiente de ${product.name}`);
                    return prev;
                }
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const calculateCartTotal = () => {
        return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    };

    const preparePrintData = (transaction: any, itemsOverride?: any[]) => {
        // If it's a manual sale, items might be empty, so relies on description
        // If POS, we might have items in transaction or we pass them
        setPrintData({
            id: transaction.id,
            timestamp: transaction.timestamp || new Date().toISOString(),
            description: transaction.description,
            amount: transaction.amount,
            paymentMethod: transaction.paymentMethod || 'CASH',
            items: itemsOverride || [] // Passed for POS immediate print
        });
        setShowPrintConfirm(true);
    };

    const handleConfirmPrint = () => {
        setShowPrintConfirm(false);
        setTimeout(() => handlePrintReceipt(), 100);
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;
        setLoading(true);
        try {
            const response = await saleService.create(description, Number(amount), paymentMethod);

            // Prepare print
            preparePrintData({
                id: response.id || 'NEW', // In case response doesn't have ID immediately, ideally it does
                timestamp: new Date().toISOString(),
                description,
                amount: Number(amount),
                paymentMethod
            });

            setDescription('');
            setAmount('');
            setPaymentMethod('CASH');
            toast.success('Ingreso registrado!');
            fetchTransactions();
        } catch (error) {
            toast.error('Error al registrar ingreso');
        } finally {
            setLoading(false);
        }
    };

    const handlePOSSubmit = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
            const total = calculateCartTotal();
            const itemsPayload = cart.map(item => ({
                productId: item.product.id,
                quantity: item.quantity
            }));
            const itemsForPrint = cart.map(item => ({
                productName: item.product.name,
                price: item.product.price,
                quantity: item.quantity
            }));

            // We pass placeholder description/amount, backend recalculates/overrides based on items
            // Wait for response to get ID
            const response = await saleService.create('Venta POS', total, paymentMethod, itemsPayload);

            setPrintData({
                id: response?.id || '???',
                timestamp: new Date().toISOString(),
                description: 'Venta POS',
                amount: total,
                paymentMethod,
                items: itemsForPrint
            });
            setShowPrintConfirm(true);

            setCart([]);
            setPaymentMethod('CASH');
            toast.success('Venta registrada!');
            fetchTransactions();
            loadProducts(); // Refresh stock
        } catch (error) {
            toast.error('Error al registrar venta');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReprint = (transaction: any) => {
        // Since we don't store items structure in description clearly for now in this view, 
        // we might just print description. Backend stores "Venta: 2x Coca Cola..." string in description.
        // If we want detailed items we would need to fetch transaction details or parse description.
        // For simplicity, reprint uses the stored text description.
        setPrintData({
            id: transaction.id,
            timestamp: transaction.timestamp,
            description: transaction.description,
            amount: transaction.amount,
            paymentMethod: transaction.paymentMethod,
            items: []
        });
        setTimeout(() => handlePrintReceipt(), 100);
    };

    if (!activeShift) {
        return <div className="p-8 text-center text-gray-500">No hay un turno activo. Inicie turno en Inicio para registrar ingresos.</div>;
    }

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-display font-bold text-brand-blue flex items-center">
                    <DollarSign className="mr-2" /> Ingresos & Ventas
                </h1>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('POS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${mode === 'POS' ? 'bg-white text-brand-blue ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Punto de Venta
                    </button>
                    <button
                        onClick={() => setMode('MANUAL')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${mode === 'MANUAL' ? 'bg-white text-brand-blue ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Manual
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left Panel: Content */}
                <div className="flex-1 overflow-y-auto pr-2">
                    {mode === 'MANUAL' ? (
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-brand-green">
                            <h2 className="text-lg font-display font-bold mb-4 text-gray-700">Registrar Ingreso Vario</h2>
                            <form onSubmit={handleManualSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Descripción</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-shadow"
                                        required={mode === 'MANUAL'}
                                        name="description"
                                        id="description"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700">Monto</label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-shadow"
                                            required={mode === 'MANUAL'}
                                            name="amount"
                                            id="amount"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700">Pago</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'TRANSFER')}
                                            className="mt-1 block w-full border rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-shadow"
                                        >
                                            <option value="CASH">Efectivo</option>
                                            <option value="TRANSFER">Transferencia</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brand-yellow text-brand-blue font-bold py-3 rounded-lg hover:bg-yellow-400 shadow-md transform transition-transform active:scale-95"
                                >
                                    Registrar
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => addToCart(p)}
                                    disabled={p.stock <= 0}
                                    data-testid={`product-pos-btn-${p.name}`}
                                    className={`p-4 rounded-xl shadow-sm border text-left transition-all ${p.stock > 0
                                        ? 'bg-white hover:border-blue-500 hover:shadow-md cursor-pointer'
                                        : 'bg-gray-100 opacity-60 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="font-bold text-gray-800 truncate">{p.name}</div>
                                    <div className="text-blue-600 font-bold mt-1">${p.price.toLocaleString()}</div>
                                    <div className={`text-xs mt-2 ${p.stock <= 5 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                        Stock: {p.stock}
                                    </div>
                                </button>
                            ))}
                            {products.length === 0 && (
                                <div className="col-span-full text-center py-10 text-gray-500">
                                    <Package size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No hay productos registrados.</p>
                                    <p className="text-sm">Agregue productos desde el panel de Inventario.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Transaction History (Always visible below) */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial Reciente</h3>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-brand-blue/5">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Hora</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Descripción</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Monto</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Ticket</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transactions.slice(0, 10).map(t => (
                                        <tr key={t.id}>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(t.timestamp).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {t.description}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                                                ${Number(t.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleReprint(t)}
                                                    className="text-gray-400 hover:text-blue-600"
                                                    title="Reimprimir Recibo"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Cart (Only in POS mode) */}
                {mode === 'POS' && (
                    <div className="w-80 bg-white shadow-lg rounded-xl flex flex-col h-full border border-gray-200">
                        <div className="p-4 border-b bg-gray-50 rounded-t-xl">
                            <h2 className="font-bold text-gray-800 flex items-center">
                                <ShoppingCart className="mr-2" size={20} /> Pedido Actual
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {cart.length === 0 ? (
                                <div className="text-center text-gray-400 py-10">
                                    Carro vacío
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <div className="font-medium text-sm">{item.product.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {item.quantity} x ${item.product.price.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-bold text-gray-700 mr-3">
                                                ${(item.quantity * item.product.price).toLocaleString()}
                                            </span>
                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-gray-600">Total</span>
                                <span className="text-2xl font-bold text-green-600">
                                    ${calculateCartTotal().toLocaleString()}
                                </span>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Método de Pago</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'TRANSFER')}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 text-sm bg-white"
                                >
                                    <option value="CASH">Efectivo</option>
                                    <option value="TRANSFER">Transferencia</option>
                                </select>
                            </div>

                            <button
                                onClick={handlePOSSubmit}
                                disabled={cart.length === 0 || loading}
                                data-testid="btn-confirm-pos-sale"
                                className="w-full bg-brand-yellow text-brand-blue py-3 rounded-lg font-bold shadow-lg hover:bg-yellow-400 disabled:bg-gray-400 disabled:shadow-none transition-all active:scale-95"
                            >
                                Confirmar Venta
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Hidden Print Receipt */}
            <div style={{ display: 'none' }}>
                {printData && <PrintSaleReceipt ref={receiptRef} transaction={printData} settings={settings} />}
            </div>

            {/* Print Confirmation Modal */}
            {showPrintConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4 text-green-600">✅ Venta Registrada</h2>
                        <div className="mb-6">
                            <p className="text-gray-600">La transacción se ha guardado correctamente.</p>
                            <p className="font-bold text-lg mt-2">${printData?.amount?.toLocaleString()}</p>
                        </div>
                        <p className="text-gray-600 mb-6">¿Desea imprimir el recibo?</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowPrintConfirm(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
                            >
                                No
                            </button>
                            <button
                                onClick={handleConfirmPrint}
                                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                            >
                                🖨️ Sí, Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
