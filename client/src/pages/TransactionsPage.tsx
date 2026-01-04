// React import not needed
import { Receipt, Download, Filter } from 'lucide-react';
import { useTransactionsPage } from '../hooks/useTransactionsPage';
import { TransactionList } from '../components/transactions/TransactionList';
import { formatCurrency } from '../utils/formatters';

export default function TransactionsPage() {
    const {
        loading,
        filteredTransactions,
        filterType,
        setFilterType,
        filterPayment,
        setFilterPayment,
        totals,
        handleExport
    } = useTransactionsPage();

    if (loading) return <div className="p-8">Cargando...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-display font-bold text-brand-blue dark:text-white flex items-center">
                    <Receipt className="mr-3" /> Transacciones del Turno
                </h1>
                <button
                    onClick={handleExport}
                    className="bg-brand-blue dark:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-800 dark:hover:bg-blue-700 shadow-md transition-all flex items-center gap-2"
                >
                    <Download size={18} />
                    Exportar a Excel
                </button>
            </div>

            {/* Filters */}
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

            {/* Totals */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors">
                    <p className="text-sm font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Total General</p>
                    <div className="text-3xl font-display font-bold text-brand-green dark:text-brand-green">{formatCurrency(totals.all)}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 transition-colors">
                    <p className="text-sm font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">💵 Efectivo</p>
                    <div className="text-3xl font-display font-bold text-gray-800 dark:text-white">{formatCurrency(totals.cash)}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800 transition-colors">
                    <p className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">🏦 Transferencia</p>
                    <div className="text-3xl font-display font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totals.transfer)}</div>
                </div>
            </div>

            {/* Transactions Table */}
            <TransactionList transactions={filteredTransactions} />
        </div>
    );
}
