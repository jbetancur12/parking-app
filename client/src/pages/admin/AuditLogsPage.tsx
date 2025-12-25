import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Shield, Clock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
    id: number;
    action: string;
    entity: string;
    entityId: string;
    userId: number;
    username: string;
    details: string; // JSON string
    ipAddress: string;
    timestamp: string;
}

export default function AuditLogsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchLogs();
    }, [user, navigate]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/audit'); // Uses existing audit.routes.ts
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Error al cargar historial de auditoría');
        } finally {
            setLoading(false);
        }
    };

    const formatDetails = (jsonString: string) => {
        try {
            const obj = JSON.parse(jsonString);
            return (
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(obj, null, 2)}
                </pre>
            );
        } catch (e) {
            return <span className="text-gray-500 italic">{jsonString}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Shield className="mr-3 h-8 w-8 text-blue-600" />
                        Log de Auditoría
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">Registro de seguridad y acciones sensibles</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                    Recargar
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Cargando registros...</div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No hay registros de auditoría aún</div>
                ) : (
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
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 align-top">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                <UserIcon className="h-4 w-4 text-gray-500" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{log.username}</div>
                                                <div className="text-xs text-gray-400">{log.ipAddress}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                log.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {log.entity} <span className="text-xs text-gray-400">#{log.entityId}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-sm">
                                        {formatDetails(log.details)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
