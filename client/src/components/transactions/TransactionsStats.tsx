import { formatCurrency } from '../../utils/formatters';

interface TransactionsStatsProps {
    totals: {
        all: number;
        cash: number;
        transfer: number;
    };
}

export const TransactionsStats: React.FC<TransactionsStatsProps> = ({ totals }) => {
    return (
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
    );
};
