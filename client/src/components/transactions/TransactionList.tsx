// React import not needed
import { getTypeLabel, getTypeColor, formatDescription, type Transaction } from '../../hooks/useTransactionsPage';

interface TransactionListProps {
    transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-brand-blue/5">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Descripción</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Método Pago</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue uppercase tracking-wider">Monto</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Fecha/Hora</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getTypeColor(transaction.type)}`}>
                                    {getTypeLabel(transaction.type)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-700">{formatDescription(transaction.description)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {transaction.paymentMethod ? (
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${transaction.paymentMethod === 'CASH'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {transaction.paymentMethod === 'CASH' ? '💵 Efectivo' : '🏦 Transferencia'}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 text-xs">N/A</span>
                                )}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${transaction.type === 'EXPENSE' ? 'text-red-500' : 'text-brand-green'
                                }`}>
                                {transaction.type === 'EXPENSE' ? '-' : '+'}${transaction.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(transaction.timestamp).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                                No hay transacciones que coincidan con los filtros.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
