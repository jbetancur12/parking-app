import React from 'react';
import { Clock, User as UserIcon } from 'lucide-react';
import type { AuditLog } from '../../../hooks/useAuditLogs';

interface AuditLogListProps {
    logs: AuditLog[];
    loading: boolean;
}

export const AuditLogList: React.FC<AuditLogListProps> = ({ logs, loading }) => {
    const formatDetails = (jsonString: string) => {
        try {
            const obj = JSON.parse(jsonString);
            return (
                <pre className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-xs overflow-auto max-h-40 text-gray-800 dark:text-gray-200 scrollbar-thin">
                    {JSON.stringify(obj, null, 2)}
                </pre>
            );
        } catch (e) {
            return <span className="text-gray-500 dark:text-gray-400 italic">{jsonString}</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors">
            {loading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando registros...</div>
            ) : logs.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">No hay registros de auditoría aún</div>
            ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-brand-blue/5 dark:bg-brand-blue/20">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Sede</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Acción</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Entidad</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue dark:text-blue-300 uppercase tracking-wider">Detalles</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 align-top transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {/* Display Location Name if available */}
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                        {log.location?.name || 'Global'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                            <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{log.username}</div>
                                            <div className="text-xs text-gray-400">{log.ipAddress}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${log.action === 'DELETE' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                            log.action === 'UPDATE' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                                'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {log.entity} <span className="text-xs text-gray-400">#{log.entityId}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                                    {formatDetails(log.details)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
