import React from 'react';

interface ManualIncomeFormProps {
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    description: string;
    setDescription: (val: string) => void;
    amount: string;
    setAmount: (val: string) => void;
    paymentMethod: 'CASH' | 'TRANSFER';
    setPaymentMethod: (val: 'CASH' | 'TRANSFER') => void;
}

export const ManualIncomeForm: React.FC<ManualIncomeFormProps> = ({
    onSubmit,
    loading,
    description,
    setDescription,
    amount,
    setAmount,
    paymentMethod,
    setPaymentMethod
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-brand-green">
            <h2 className="text-lg font-display font-bold mb-4 text-gray-700">Registrar Ingreso Vario</h2>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700">Descripción</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-shadow"
                        required
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
                            required
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
                    className={`w-full bg-brand-yellow text-brand-blue font-bold py-3 rounded-lg hover:bg-yellow-400 shadow-md transform transition-transform active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Registrando...' : 'Registrar'}
                </button>
            </form>
        </div>
    );
};
