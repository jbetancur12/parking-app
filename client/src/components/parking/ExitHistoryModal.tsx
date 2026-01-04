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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Salidas Recientes (Turno Actual)</h2>
                        <p className="text-sm text-gray-500">Reimprimir recibos de vehículos retirados</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Search */}
                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar placa..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none uppercase"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8">Cargando salidas...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada / Salida</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredHistory.map((session: any) => {
                                        const entry = new Date(session.entryTime);
                                        const exit = new Date(session.exitTime);
                                        const diffMs = exit.getTime() - entry.getTime();
                                        const hours = Math.floor(diffMs / (1000 * 60 * 60));
                                        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                        const duration = `${hours}h ${minutes}m`;

                                        return (
                                            <tr key={session.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-lg font-bold text-gray-900">{session.plate}</span>
                                                    <div className="text-xs text-gray-500">{session.vehicleType}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>In: {entry.toLocaleTimeString()}</div>
                                                    <div>Out: {exit.toLocaleTimeString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {duration}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                                    {formatCurrency(Number(session.cost))}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => onReprint({ ...session, duration })}
                                                        className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
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
                                            <td colSpan={5} className="text-center py-8 text-gray-500 italic">
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
