import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, RefreshCw } from 'lucide-react';

interface AuditLog {
    id: number;
    action: string;
    entity: string;
    entityId?: string;
    username?: string;
    details?: string;
    timestamp: string;
}

export default function AuditPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            fetchLogs();
        }
    }, [user]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/audit');
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return (
            <div className="p-8 text-center text-red-600">
                No tienes permisos para ver esta página.
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Shield className="mr-2 text-purple-600" /> Auditoría de Seguridad
                </h1>
                <button
                    onClick={fetchLogs}
                    className="flex items-center bg-white text-gray-600 px-4 py-2 rounded-lg border hover:bg-gray-50"
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading && logs.length === 0 && (
                            <tr><td colSpan={5} className="p-4 text-center">Cargando...</td></tr>
                        )}
                        {!loading && logs.length === 0 && (
                            <tr><td colSpan={5} className="p-4 text-center text-gray-500">No hay registros de auditoría.</td></tr>
                        )}
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {log.username || 'Sistema'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                                    {log.action}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.entity} <span className="text-xs text-gray-400">#{log.entityId || '-'}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {log.details ? (
                                        <span title={log.details} className="cursor-help">
                                            {log.details.length > 50 ? log.details.substring(0, 50) + '...' : log.details}
                                        </span>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
