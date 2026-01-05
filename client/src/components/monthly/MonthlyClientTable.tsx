import React, { memo } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { type Client } from '../../hooks/business/useMonthlyClients';

interface MonthlyClientTableProps {
    clients: Client[];
    onHistory: (client: Client) => void;
    onRenew: (client: Client) => void;
    onToggleStatus: (clientId: number, isActive: boolean) => void;
    onAnonymize: (clientId: number) => void;
    filterStatus: string;
}

export const MonthlyClientTable: React.FC<MonthlyClientTableProps> = memo(({
    clients,
    onHistory,
    onRenew,
    onToggleStatus,
    onAnonymize,
    filterStatus
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-brand-blue/5 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Contacto</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {clients.map((client) => {
                            const isExpired = new Date(client.endDate) < new Date();
                            return (
                                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{client.plate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {client.phone || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            {client.isActive ? (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${isExpired ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'}`}>
                                                    {isExpired ? 'Vencido' : 'Activo'}
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 w-fit">
                                                    Desactivado
                                                </span>
                                            )}
                                            <div className="text-xs text-gray-400 mt-1">
                                                Vence: {new Date(client.endDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => onHistory(client)}
                                            className="text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                                        >
                                            Historial
                                        </button>

                                        <button
                                            onClick={() => onRenew(client)}
                                            className="text-green-600 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                                            title="Renovar y Activar"
                                        >
                                            <RefreshCw size={14} className="inline mr-1" />
                                            Renovar
                                        </button>

                                        {/* Deactivate/Activate button */}
                                        {client.isActive ? (
                                            isExpired && (
                                                <button
                                                    onClick={() => onToggleStatus(client.id, true)}
                                                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                                                >
                                                    Desactivar
                                                </button>
                                            )
                                        ) : (
                                            <button
                                                onClick={() => onToggleStatus(client.id, false)}
                                                className="text-purple-600 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                                            >
                                                Activar
                                            </button>
                                        )}

                                        <button
                                            onClick={() => onAnonymize(client.id)}
                                            className="text-gray-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded-full transition-colors"
                                            title="Derecho al Olvido (Anonimizar)"
                                        >
                                            <span className="sr-only">Anonimizar</span>
                                            <AlertTriangle size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {clients.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No hay clientes {filterStatus === 'ACTIVE' ? 'activos' : filterStatus === 'EXPIRED' ? 'vencidos' : ''}.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                {clients.map((client) => {
                    const isExpired = new Date(client.endDate) < new Date();
                    return (
                        <div key={client.id} className="p-4 flex flex-col gap-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{client.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{client.plate}</p>
                                </div>
                                {client.isActive ? (
                                    <span className={`px-2 py-0.5 mt-1 text-xs font-semibold rounded-full ${isExpired ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'}`}>
                                        {isExpired ? 'Vencido' : 'Activo'}
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 mt-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                        Desactivado
                                    </span>
                                )}
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-300 flex justify-between">
                                <span>Vence: {new Date(client.endDate).toLocaleDateString()}</span>
                                <span>{client.phone || 'Sin télefono'}</span>
                            </div>

                            <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                                <button
                                    onClick={() => onHistory(client)}
                                    className="text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg text-xs font-medium flex-1 text-center"
                                >
                                    Historial
                                </button>
                                <button
                                    onClick={() => onRenew(client)}
                                    className="text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded-lg text-xs font-bold flex-1 text-center"
                                >
                                    <RefreshCw size={14} className="inline mr-1" />
                                    Renovar
                                </button>
                            </div>
                        </div>
                    );
                })}
                {clients.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No hay clientes coincidentes.
                    </div>
                )}
            </div>
        </div>
    );
});
