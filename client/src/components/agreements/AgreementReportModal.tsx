import React, { useEffect, useState } from 'react';
import { X, BarChart, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import api from '../../services/api';
import { toast } from 'sonner';

interface AgreementStat {
    id: number;
    name: string;
    type: string;
    value: number;
    usageCount: number;
    totalDiscount: number;
}

interface AgreementReportModalProps {
    onClose: () => void;
}

export const AgreementReportModal: React.FC<AgreementReportModalProps> = ({ onClose }) => {
    const [stats, setStats] = useState<AgreementStat[]>([]);
    const [loading, setLoading] = useState(true);
    // Default to current month
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Calculate start and end of selected month
                const [year, month] = selectedDate.split('-').map(Number);
                const startDate = new Date(year, month - 1, 1).toISOString();
                const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

                const response = await api.get('/agreements/stats', {
                    params: { startDate, endDate }
                });
                setStats(response.data);
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar reporte de convenios');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedDate]);

    const totalUsage = stats.reduce((acc, curr) => acc + curr.usageCount, 0);
    const totalDiscount = stats.reduce((acc, curr) => acc + curr.totalDiscount, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                            <BarChart size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reporte de Uso de Convenios</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Estadísticas de ejecución y descuentos otorgados</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="month"
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Convenios Ejecutados</p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalUsage}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800/50">
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Total Descuentos Otorgados</p>
                                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{formatCurrency(totalDiscount)}</p>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Convenio</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo / Valor</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uso (Cant.)</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Desc.</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">% Uso</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {stats.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {item.type === 'FREE_HOURS' ? `${item.value}h Gratis` :
                                                        item.type === 'PERCENTAGE' ? `${item.value}%` :
                                                            formatCurrency(item.value)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                                                    {item.usageCount}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                                                    {formatCurrency(item.totalDiscount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                                                    {totalUsage > 0 ? ((item.usageCount / totalUsage) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                        ))}
                                        {stats.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                    No hay datos de uso de convenios registrados aún.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t dark:border-gray-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
