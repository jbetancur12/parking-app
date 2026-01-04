// React import not needed
import { getTypeLabel, getTypeColor, formatDescription, type Transaction } from '../../hooks/useTransactionsPage';
import { formatCurrency } from '../../utils/formatters';

interface TransactionListProps {
    transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-brand-blue/5 dark:bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Descripción</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Método Pago</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Monto</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Fecha/Hora</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getTypeColor(transaction.type)}`}>
                                    {getTypeLabel(transaction.type)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">{formatDescription(transaction.description)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {transaction.paymentMethod ? (
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${transaction.paymentMethod === 'CASH'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                        }`}>
                                        {transaction.paymentMethod === 'CASH' ? '💵 Efectivo' : '🏦 Transferencia'}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 text-xs">N/A</span>
                                )}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${transaction.type === 'EXPENSE' ? 'text-red-500 dark:text-red-400' : 'text-brand-green dark:text-brand-green'
                                }`}>
                                {transaction.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(transaction.timestamp).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                                No hay transacciones que coincidan con los filtros.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
