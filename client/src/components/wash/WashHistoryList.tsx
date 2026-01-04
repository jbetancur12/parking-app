import React from 'react';
import { type WashEntry } from '../../services/wash.service';

interface WashHistoryListProps {
    entries: WashEntry[];
    onReprint: (entry: WashEntry) => void;
}

export const WashHistoryList: React.FC<WashHistoryListProps> = ({ entries, onReprint }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-brand-blue/5 dark:bg-gray-800">
                <h3 className="text-lg font-display font-bold text-gray-800 dark:text-gray-100">Historial del Día (Turno Actual)</h3>
            </div>
            {entries.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8 font-sans">No hay lavados registrados en este turno.</p>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Placa</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Servicio</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Operario</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Monto</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {entries.map(entry => (
                                    <tr key={entry.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(entry.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                            {entry.plate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {(entry as any).serviceType?.name || 'Lavado'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {entry.operatorName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-800 dark:text-gray-200">
                                            ${Number(entry.cost).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => onReprint(entry)}
                                                className="text-brand-blue dark:text-blue-300 hover:text-blue-900 dark:hover:text-white transition-colors"
                                                title="Imprimir Recibo"
                                            >
                                                🖨️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile List View */}
                    <div className="md:hidden">
                        {entries.map(entry => (
                            <div key={entry.id} className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-display font-bold text-lg text-gray-900 dark:text-white">{entry.plate}</span>
                                        <span className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{(entry as any).serviceType?.name || 'Lavado'}</p>
                                    <p className="text-xs text-gray-400 mt-1">Op: {entry.operatorName || '-'}</p>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-brand-green dark:text-green-400 text-lg block">${Number(entry.cost).toLocaleString()}</span>
                                    <button
                                        onClick={() => onReprint(entry)}
                                        className="text-brand-blue dark:text-blue-300 text-sm underline mt-1"
                                    >
                                        Reimprimir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
