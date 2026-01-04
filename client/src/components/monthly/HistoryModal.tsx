import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type Client } from '../../hooks/useMonthlyClients';
import { formatCurrency } from '../../utils/formatters';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    fetchHistory: (id: number) => Promise<any[]>;
    onReprint: (payment: any) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, client, fetchHistory, onReprint }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && client) {
            setLoading(true);
            fetchHistory(client.id)
                .then(setHistory)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, client, fetchHistory]);

    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl border dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 z-10 pb-2 border-b dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Historial de Pagos</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{client.name} - {client.plate}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"><X size={20} /></button>
                </div>
                {loading ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">Cargando historial...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha Pago</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Periodo</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Monto</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {history.map((payment: any) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(payment.paymentDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {new Date(payment.periodStart).toLocaleDateString()} - {new Date(payment.periodEnd).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    ({Math.round((new Date(payment.periodEnd).getTime() - new Date(payment.periodStart).getTime()) / (1000 * 60 * 60 * 24))} días)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            {formatCurrency(Number(payment.amount))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => onReprint(payment)}
                                                className="text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white text-xs font-medium bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                            >
                                                Imprimir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400 italic">No se encontró historial de pagos</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
