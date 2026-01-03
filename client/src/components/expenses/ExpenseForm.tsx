import React from 'react';
import { Plus } from 'lucide-react';

interface ExpenseFormProps {
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    description: string;
    setDescription: (val: string) => void;
    amount: string;
    setAmount: (val: string) => void;
    paymentMethod: 'CASH' | 'TRANSFER';
    setPaymentMethod: (val: 'CASH' | 'TRANSFER') => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
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
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 mb-8">
            <h2 className="text-lg font-display font-bold mb-4 text-gray-700">Registrar Nuevo Egreso</h2>
            <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border outline-none transition-shadow"
                        placeholder="e.j. Jabón, Almuerzo"
                        required
                        name="description"
                        id="description"
                    />
                </div>
                <div className="w-full md:w-40">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Monto</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border outline-none transition-shadow"
                        placeholder="0.00"
                        min="0"
                        required
                        name="amount"
                        id="amount"
                    />
                </div>
                <div className="w-full md:w-40">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Método de Pago</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'TRANSFER')}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border bg-white outline-none transition-shadow"
                    >
                        <option value="CASH">Efectivo</option>
                        <option value="TRANSFER">Transferencia</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-yellow text-brand-blue font-bold py-2 px-6 rounded-lg hover:bg-yellow-400 disabled:bg-gray-400 shadow-md transition-transform active:scale-95 flex items-center justify-center h-10 w-full md:w-auto mt-2 md:mt-0"
                >
                    <Plus size={18} className="mr-2" />
                    Registrar
                </button>
            </form>
        </div>
    );
};
