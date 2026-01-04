import React from 'react';
import { Building2, MapPin } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface ConsolidatedReportViewProps {
    data: any;
}

export const ConsolidatedReportView: React.FC<ConsolidatedReportViewProps> = ({ data }) => {
    if (!data?.globalStats) return null;
    const { globalStats, locationStats } = data;

    return (
        <div className="space-y-8">
            {/* Global Summary */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-4 flex items-center">
                    <Building2 className="mr-2" /> Resumen Global ({data.tenant?.name})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-600 dark:border-blue-500 transition-colors">
                        <div className="text-gray-500 dark:text-gray-400 text-sm">Ingresos Totales</div>
                        <div className="text-3xl font-bold text-gray-800 dark:text-white">{formatCurrency(globalStats.totalIncome)}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{globalStats.transactionCount} transacciones en total</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-red-500 dark:border-red-400 transition-colors">
                        <div className="text-gray-500 dark:text-gray-400 text-sm">Egresos Totales</div>
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(globalStats.totalExpenses)}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-600 dark:border-green-500 transition-colors">
                        <div className="text-gray-500 dark:text-gray-400 text-sm">Utilidad Neta</div>
                        <div className="text-3xl font-bold text-green-700 dark:text-green-400">{formatCurrency(globalStats.totalIncome - globalStats.totalExpenses)}</div>
                    </div>
                </div>
            </div>

            {/* Location Breakdown */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-4 flex items-center">
                    <MapPin className="mr-2" /> Desglose por Sede
                </h3>
                <div className="grid grid-cols-1 gap-6">
                    {locationStats.map((loc: any) => (
                        <div key={loc.locationId} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors">
                            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center transition-colors">
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{loc.locationName}</h4>
                                <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">{loc.transactionCount} txs</span>
                            </div>
                            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Ingresos</div>
                                    <div className="font-bold text-green-700 dark:text-green-400">{formatCurrency(loc.totalIncome)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Egresos</div>
                                    <div className="font-bold text-red-600 dark:text-red-400">{formatCurrency(loc.totalExpenses)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Parqueo</div>
                                    <div className="font-bold text-gray-700 dark:text-gray-200">{formatCurrency(loc.parkingHourly + loc.parkingDaily)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Neto</div>
                                    <div className="font-bold text-blue-700 dark:text-blue-400">{formatCurrency(loc.totalIncome - loc.totalExpenses)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
