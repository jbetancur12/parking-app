import React from 'react';
import { formatDescription, getTypeLabel } from '../../hooks/useReportsPage';
import { formatCurrency } from '../../utils/formatters';

interface StandardReportViewProps {
    data: any;
    reportType: 'DAILY' | 'SHIFT' | 'RANGE';
}

export const StandardReportView: React.FC<StandardReportViewProps> = ({ data, reportType }) => {
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-brand-blue dark:border-blue-500 transition-colors">
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Ingresos Totales</div>
                    <div className="text-3xl font-display font-bold text-brand-blue dark:text-blue-300 mt-1">{formatCurrency(data.summary?.totalIncome || data.totalIncome || 0)}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-brand-green dark:border-green-500 transition-colors">
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Transacciones</div>
                    <div className="text-3xl font-display font-bold text-gray-800 dark:text-white mt-1">{data.summary?.transactionCount || data.transactionCount || 0}</div>
                </div>
                {reportType === 'SHIFT' && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-purple-500 dark:border-purple-400 transition-colors">
                        <div className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Efectivo en Caja (Est.)</div>
                        <div className="text-3xl font-display font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(data.summary?.cashInHand || 0)}</div>
                    </div>
                )}
            </div>

            {/* Detailed Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-b-4 border-red-400 dark:border-red-500 transition-colors">
                    <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Egresos</div>
                    <div className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(data.totalExpenses || 0)}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-b-4 border-green-400 dark:border-green-500 transition-colors">
                    <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Otros Ingresos</div>
                    <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(data.otherIncome || 0)}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-b-4 border-blue-400 dark:border-blue-500 transition-colors">
                    <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Parqueo (Hora)</div>
                    <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(data.parkingHourly || 0)}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-b-4 border-purple-400 dark:border-purple-500 transition-colors">
                    <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Parqueo (Día)</div>
                    <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(data.parkingDaily || 0)}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-b-4 border-indigo-400 dark:border-indigo-500 transition-colors">
                    <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Mensualidades</div>
                    <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(data.monthlyIncome || 0)}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-b-4 border-cyan-400 dark:border-cyan-500 transition-colors">
                    <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Lavadero</div>
                    <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(data.washIncome || 0)}</div>
                </div>
            </div>

            {/* Detailed List */}
            {data.transactions && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <h3 className="text-lg font-display font-bold text-brand-blue dark:text-blue-300">Detalles de Transacciones</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-brand-blue/5 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Hora</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {data.transactions.map((t: any) => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(t.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {formatDescription(t.description)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${t.type === 'EXPENSE' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                            {getTypeLabel(t.type)}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold font-mono ${t.type === 'EXPENSE' ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                        {formatCurrency(Number(t.amount))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
