import { Filter } from 'lucide-react';

interface TransactionsFilterProps {
    filterType: string;
    setFilterType: (value: string) => void;
    filterPayment: string;
    setFilterPayment: (value: string) => void;
}

export const TransactionsFilter: React.FC<TransactionsFilterProps> = ({
    filterType,
    setFilterType,
    filterPayment,
    setFilterPayment
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-blue-50 dark:border-gray-700 mb-6 transition-colors">
            <div className="flex items-center gap-4 mb-4">
                <Filter size={20} className="text-brand-blue dark:text-blue-400" />
                <span className="font-bold text-gray-700 dark:text-gray-200">Filtros:</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Type Filter */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tipo de Transacción</label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="ALL">Todos</option>
                        <option value="PARKING_REVENUE">Parqueo</option>
                        <option value="MONTHLY_PAYMENT">Mensualidad</option>
                        <option value="WASH_SERVICE">Lavadero</option>
                        <option value="INCOME">Ingreso Adicional</option>
                        <option value="EXPENSE">Egreso</option>
                    </select>
                </div>

                {/* Payment Method Filter */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Método de Pago</label>
                    <select
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="ALL">Todos</option>
                        <option value="CASH">💵 Efectivo</option>
                        <option value="TRANSFER">🏦 Transferencia</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
