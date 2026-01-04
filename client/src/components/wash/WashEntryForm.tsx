import React from 'react';
import { Plus } from 'lucide-react';
import { type WashServiceType } from '../../services/wash.service';
import { CurrencyInput } from '../common/CurrencyInput';

interface WashEntryFormProps {
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    types: WashServiceType[];
    plate: string;
    setPlate: (val: string) => void;
    selectedType: number | '';
    setSelectedType: (val: number) => void;
    price: string;
    setPrice: (val: string) => void;
    operator: string;
    setOperator: (val: string) => void;
    paymentMethod: 'CASH' | 'TRANSFER';
    setPaymentMethod: (val: 'CASH' | 'TRANSFER') => void;
}

export const WashEntryForm: React.FC<WashEntryFormProps> = ({
    onSubmit,
    loading,
    types,
    plate,
    setPlate,
    selectedType,
    setSelectedType,
    price,
    setPrice,
    operator,
    setOperator,
    paymentMethod,
    setPaymentMethod
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-brand-blue dark:border-brand-blue/80 transition-colors">
            <h2 className="text-lg font-display font-bold mb-4 text-brand-blue dark:text-blue-300">Nuevo Servicio</h2>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Placa</label>
                    <input
                        type="text"
                        value={plate}
                        onChange={e => setPlate(e.target.value.toUpperCase())}
                        className="w-full border rounded-lg px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-shadow bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="ABC-123"
                        required
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Servicio</label>
                    <select
                        value={selectedType}
                        onChange={e => setSelectedType(Number(e.target.value))}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-shadow bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        required
                    >
                        <option value="">Seleccione Servicio...</option>
                        {types.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.name} - ${t.price} (Sugerido)
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Precio (Opcional)</label>
                    <CurrencyInput
                        value={price}
                        onValueChange={setPrice}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none font-semibold text-gray-700 transition-shadow bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Sugerido..."
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Operario (Opcional)</label>
                    <input
                        type="text"
                        value={operator}
                        onChange={e => setOperator(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-shadow bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Nombre"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Pago</label>
                    <select
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value as 'CASH' | 'TRANSFER')}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-shadow"
                    >
                        <option value="CASH">Efectivo</option>
                        <option value="TRANSFER">Transf.</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`bg-brand-yellow text-brand-blue font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 shadow-md flex items-center justify-center h-10 w-full md:w-auto md:col-start-6 transform transition-transform active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? '...' : <Plus size={18} className="mr-2" />}
                    {loading ? 'Registrando' : 'Registrar'}
                </button>
            </form>
        </div>
    );
};
