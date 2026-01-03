import React from 'react';
import { type Expense } from '../../services/expense.service';
import { formatCurrency } from '../../utils/formatters';

interface ExpenseListProps {
    expenses: Expense[];
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">Historial del Día (Turno Actual)</h3>
            </div>
            {expenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay egresos registrados en este turno.</p>
            ) : (
                <>
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-brand-blue/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Descripción</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {expenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(exp.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {exp.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold text-right">
                                            - {formatCurrency(Number(exp.amount))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {expenses.map(exp => (
                            <div key={exp.id} className="p-4 flex flex-col gap-1">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-gray-800">{exp.description}</span>
                                    <span className="text-red-600 font-bold">- {formatCurrency(Number(exp.amount))}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
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
