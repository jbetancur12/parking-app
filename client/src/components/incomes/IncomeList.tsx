import React from 'react';
import { Printer } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface IncomeListProps {
    transactions: any[];
    onReprint: (transaction: any) => void;
}

export const IncomeList: React.FC<IncomeListProps> = ({ transactions, onReprint }) => {
    return (
        <div className="mt-8 hidden md:block">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Historial Reciente</h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-brand-blue/5 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Ticket</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {transactions.slice(0, 10).map(t => (
                            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(t.timestamp).toLocaleTimeString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                    {t.description}
                                </td>
                                <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(Number(t.amount))}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => onReprint(t)}
                                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        title="Reimprimir Recibo"
                                    >
                                        <Printer size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
