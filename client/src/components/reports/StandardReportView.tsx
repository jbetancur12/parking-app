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
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-brand-blue">
                    <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Ingresos Totales</div>
                    <div className="text-3xl font-display font-bold text-brand-blue mt-1">{formatCurrency(data.summary?.totalIncome || data.totalIncome || 0)}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-brand-green">
                    <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Transacciones</div>
                    <div className="text-3xl font-display font-bold text-gray-800 mt-1">{data.summary?.transactionCount || data.transactionCount || 0}</div>
                </div>
                {reportType === 'SHIFT' && (
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                        <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Efectivo en Caja (Est.)</div>
                        <div className="text-3xl font-display font-bold text-gray-800 mt-1">{formatCurrency(data.summary?.cashInHand || 0)}</div>
                    </div>
                )}
            </div>

            {/* Detailed Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border-b-4 border-red-400">
                    <div className="text-gray-500 text-xs font-bold uppercase">Egresos</div>
                    <div className="text-xl font-bold text-red-600">{formatCurrency(data.totalExpenses || 0)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-b-4 border-green-400">
                    <div className="text-gray-500 text-xs font-bold uppercase">Otros Ingresos</div>
                    <div className="text-xl font-bold text-gray-800">{formatCurrency(data.otherIncome || 0)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-b-4 border-blue-400">
                    <div className="text-gray-500 text-xs font-bold uppercase">Parqueo (Hora)</div>
                    <div className="text-xl font-bold text-gray-800">{formatCurrency(data.parkingHourly || 0)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-b-4 border-purple-400">
                    <div className="text-gray-500 text-xs font-bold uppercase">Parqueo (Día)</div>
                    <div className="text-xl font-bold text-gray-800">{formatCurrency(data.parkingDaily || 0)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-b-4 border-indigo-400">
                    <div className="text-gray-500 text-xs font-bold uppercase">Mensualidades</div>
                    <div className="text-xl font-bold text-gray-800">{formatCurrency(data.monthlyIncome || 0)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-b-4 border-cyan-400">
                    <div className="text-gray-500 text-xs font-bold uppercase">Lavadero</div>
                    <div className="text-xl font-bold text-gray-800">{formatCurrency(data.washIncome || 0)}</div>
                </div>
            </div>

            {/* Detailed List */}
            {data.transactions && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-display font-bold text-brand-blue">Detalles de Transacciones</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-brand-blue/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Hora</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue uppercase tracking-wider">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.transactions.map((t: any) => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(t.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatDescription(t.description)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${t.type === 'EXPENSE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {getTypeLabel(t.type)}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold font-mono ${t.type === 'EXPENSE' ? 'text-red-500' : 'text-green-600'}`}>
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
