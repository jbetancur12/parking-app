import { Receipt, Download } from 'lucide-react';
import { useTransactionsPage } from '../hooks/useTransactionsPage';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionsFilter } from '../components/transactions/TransactionsFilter';
import { TransactionsStats } from '../components/transactions/TransactionsStats';

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
            <TransactionsFilter
                filterType={filterType}
                setFilterType={setFilterType}
                filterPayment={filterPayment}
                setFilterPayment={setFilterPayment}
            />

            {/* Totals */}
            <TransactionsStats totals={totals} />

            {/* Transactions Table */}
            <TransactionList transactions={filteredTransactions} />
        </div>
    );
}
