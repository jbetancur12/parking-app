import React, { useState, useEffect } from 'react';
import { X, Printer, Search } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import api from '../../services/api';

interface ExitHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReprint: (session: any) => void;
}

export const ExitHistoryModal: React.FC<ExitHistoryModalProps> = ({ isOpen, onClose, onReprint }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get('/parking/completed');
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(item =>
        item.plate.includes(searchTerm.toUpperCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-xl border dark:border-gray-700 transition-colors">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Salidas Recientes (Turno Actual)</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Reimprimir recibos de vehículos retirados</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Search */}
                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar placa..."
                        className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none uppercase bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Cargando salidas...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Placa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entrada / Salida</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duración</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredHistory.map((session: any) => {
                                        const entry = new Date(session.entryTime);
                                        const exit = new Date(session.exitTime);
                                        const diffMs = exit.getTime() - entry.getTime();
                                        const hours = Math.floor(diffMs / (1000 * 60 * 60));
                                        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                        const duration = `${hours}h ${minutes}m`;

                                        const getVehicleTypeLabel = (type: string) => {
                                            const map: Record<string, string> = {
                                                'CAR': 'Carro',
                                                'MOTORCYCLE': 'Moto',
                                                'BICYCLE': 'Bicicleta',
                                                'TRUCK': 'Camión',
                                                'VAN': 'Van'
                                            };
                                            return map[type] || type;
                                        };

                                        return (
                                            <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{session.plate}</span>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{getVehicleTypeLabel(session.vehicleType)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    <div>Entrada: {entry.toLocaleTimeString()}</div>
                                                    <div>Salida: {exit.toLocaleTimeString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                    {duration}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(Number(session.cost))}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => onReprint({
                                                            ...session,
                                                            duration,
                                                            agreementName: session.agreement?.name
                                                        })}
                                                        className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md transition-colors"
                                                        title="Reimprimir Recibo"
                                                    >
                                                        <Printer size={16} className="mr-1" />
                                                        Recibo
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400 italic">
                                                No hay salidas recientes en este turno.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
