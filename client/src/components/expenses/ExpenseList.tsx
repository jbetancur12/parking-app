import React from 'react';
import { type Expense } from '../../services/expense.service';
import { formatCurrency } from '../../utils/formatters';

interface ExpenseListProps {
    expenses: Expense[];
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Historial del Día (Turno Actual)</h3>
            </div>
            {expenses.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay egresos registrados en este turno.</p>
            ) : (
                <>
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-brand-blue/5 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {expenses.map(exp => (
                                    <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(exp.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                            {exp.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-bold text-right">
                                            - {formatCurrency(Number(exp.amount))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                        {expenses.map(exp => (
                            <div key={exp.id} className="p-4 flex flex-col gap-1 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-gray-800 dark:text-white">{exp.description}</span>
                                    <span className="text-red-600 dark:text-red-400 font-bold">- {formatCurrency(Number(exp.amount))}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>{new Date(exp.createdAt).toLocaleTimeString()}</span>
                                    <span>{exp.paymentMethod || 'CASH'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
