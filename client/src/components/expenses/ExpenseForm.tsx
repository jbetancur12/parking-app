import React from 'react';
import { CurrencyInput } from '../common/CurrencyInput';
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-red-500 dark:border-red-400 mb-8 transition-colors">
            <h2 className="text-lg font-display font-bold mb-4 text-gray-700 dark:text-gray-200">Registrar Nuevo Egreso</h2>
            <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border outline-none transition-shadow bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="e.j. Jabón, Almuerzo"
                        required
                        name="description"
                        id="description"
                    />
                </div>
                <div className="w-full md:w-40">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Monto</label>
                    <CurrencyInput
                        value={amount}
                        onValueChange={setAmount}
                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border outline-none transition-shadow bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="0.00"
                        id="amount"
                        name="amount"
                    />
                </div>
                <div className="w-full md:w-40">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Método de Pago</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'TRANSFER')}
                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border outline-none transition-shadow bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="CASH">Efectivo</option>
                        <option value="TRANSFER">Transferencia</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-yellow text-brand-blue dark:bg-yellow-500 dark:text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-yellow-400 dark:hover:bg-yellow-400 disabled:bg-gray-400 dark:disabled:bg-gray-600 shadow-md transition-transform active:scale-95 flex items-center justify-center h-10 w-full md:w-auto mt-2 md:mt-0"
                >
                    <Plus size={18} className="mr-2" />
                    Registrar
                </button>
            </form>
        </div>
    );
};
