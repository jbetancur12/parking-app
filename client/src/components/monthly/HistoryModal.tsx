import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type Client } from '../../hooks/useMonthlyClients';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Historial de Pagos</h2>
                        <p className="text-sm text-gray-500">{client.name} - {client.plate}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors"><X size={20} /></button>
                </div>
                {loading ? (
                    <div className="text-center py-8">Cargando historial...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Pago</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {history.map((payment: any) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payment.paymentDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {new Date(payment.periodStart).toLocaleDateString()} - {new Date(payment.periodEnd).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({Math.round((new Date(payment.periodEnd).getTime() - new Date(payment.periodStart).getTime()) / (1000 * 60 * 60 * 24))} días)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                            ${Number(payment.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => onReprint(payment)}
                                                className="text-blue-600 hover:text-blue-900 text-xs font-medium bg-blue-50 px-3 py-1 rounded-full transition-colors hover:bg-blue-100"
                                            >
                                                Imprimir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-8 text-gray-500 italic">No se encontró historial de pagos</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
