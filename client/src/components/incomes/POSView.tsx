import React from 'react';
import { Package, ShoppingCart, Trash } from 'lucide-react';
import { type Product } from '../../services/product.service';

interface CartItem {
    product: Product;
    quantity: number;
}

interface POSViewProps {
    products: Product[];
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
    total: number;
    paymentMethod: 'CASH' | 'TRANSFER';
    setPaymentMethod: (val: 'CASH' | 'TRANSFER') => void;
    onSubmit: () => void;
    loading: boolean;
}

export const POSView: React.FC<POSViewProps> = ({
    products,
    cart,
    addToCart,
    removeFromCart,
    total,
    paymentMethod,
    setPaymentMethod,
    onSubmit,
    loading
}) => {
    return (
        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden h-full md:h-auto">
            {/* Left Panel: Products Grid */}
            <div className="flex-1 overflow-y-auto pr-0 md:pr-2 pb-20 md:pb-0">
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
            </div>

            {/* Right Panel: Cart */}
            <div className="w-full md:w-80 bg-white shadow-lg rounded-xl flex flex-col h-auto md:h-full border border-gray-200 md:relative fixed bottom-0 left-0 z-20 max-h-[50vh] md:max-h-none">
                {/* Mobile Handle */}
                <div className="md:hidden w-full flex justify-center pt-2 pb-1 bg-gray-50 rounded-t-xl border-t border-gray-200">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                <div className="p-4 border-b bg-gray-50 rounded-t-xl hidden md:block">
                    <h2 className="font-bold text-gray-800 flex items-center">
                        <ShoppingCart className="mr-2" size={20} /> Pedido Actual
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 py-4 md:py-10 text-sm md:text-base">
                            <ShoppingCart className="mx-auto mb-2 opacity-50 md:hidden" size={24} />
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
                            ${total.toLocaleString()}
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
                        onClick={onSubmit}
                        disabled={cart.length === 0 || loading}
                        data-testid="btn-confirm-pos-sale"
                        className={`w-full bg-brand-yellow text-brand-blue py-3 rounded-lg font-bold shadow-lg hover:bg-yellow-400 transition-all active:scale-95 flex justify-center items-center ${loading || cart.length === 0 ? 'opacity-50 cursor-not-allowed bg-gray-300' : ''}`}
                    >
                        {loading ? 'Procesando...' : 'Confirmar Venta'}
                    </button>
                </div>
            </div>
        </div>
    );
};
