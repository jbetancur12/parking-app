import { useState, useEffect } from 'react';
import { errorLogService, type ErrorLogResponse } from '../../services/errorLog.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Monitor, Globe, Search, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function ErrorLogsPage() {
    const [logs, setLogs] = useState<ErrorLogResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterResolved, setFilterResolved] = useState<boolean | undefined>(undefined);
    const [selectedLog, setSelectedLog] = useState<ErrorLogResponse | null>(null);

    useEffect(() => {
        fetchLogs();
    }, [filterResolved]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await errorLogService.getErrorLogs({
                resolved: filterResolved,
                limit: 100
            });
            setLogs(data.errorLogs);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Error al cargar los reportes');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await errorLogService.resolveError(id);
            toast.success('Error marcado como resuelto');
            // Update local state
            setLogs(logs.map(log =>
                log.id === id ? { ...log, resolved: true } : log
            ));
            if (selectedLog?.id === id) {
                setSelectedLog(prev => prev ? { ...prev, resolved: true } : null);
            }
        } catch (error) {
            toast.error('No se pudo actualizar el estado');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900">Reportes de Errores</h1>
                    <p className="text-gray-500">Monitoreo de errores del frontend</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchLogs}
                        className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        title="Recargar lista"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setFilterResolved(undefined)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterResolved === undefined
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-white border text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilterResolved(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterResolved === false
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-white border text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => setFilterResolved(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterResolved === true
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-white border text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Resueltos
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-brand-blue" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                        <div className="p-4 border-b bg-gray-50">
                            <h2 className="font-semibold text-gray-700">Listado ({logs.length})</h2>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {logs.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <CheckCircle className="mx-auto mb-2 text-green-500" size={32} />
                                    <p>No hay reportes</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {logs.map(log => (
                                        <div
                                            key={log.id}
                                            onClick={() => setSelectedLog(log)}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedLog?.id === log.id ? 'bg-blue-50 border-l-4 border-brand-blue' : ''
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {log.resolved ? 'Resuelto' : 'Pendiente'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {format(new Date(log.timestamp), 'dd MMM HH:mm', { locale: es })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                                {log.errorMessage}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                {log.user ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">
                                                            {log.user.username[0].toUpperCase()}
                                                        </span>
                                                        {log.user.username}
                                                    </span>
                                                ) : (
                                                    <span>Anónimo</span>
                                                )}
                                                <span>•</span>
                                                <span>{log.tenant?.name || 'Log out'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail View */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow border border-gray-100 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
                        {selectedLog ? (
                            <div className="flex flex-col h-full">
                                <div className="p-6 border-b flex justify-between items-start bg-gray-50">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedLog.errorMessage}</h2>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Monitor size={16} />
                                                <span className="truncate max-w-xs" title={selectedLog.userAgent}>
                                                    {selectedLog.userAgent?.split(')')[0] + ')'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Globe size={16} />
                                                <a href={selectedLog.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-xs">
                                                    {selectedLog.url}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    {!selectedLog.resolved && (
                                        <button
                                            onClick={(e) => handleResolve(selectedLog.id, e)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
                                        >
                                            <CheckCircle size={16} />
                                            Marcar Resuelto
                                        </button>
                                    )}
                                </div>
                                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                                    {/* Stack Trace */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Stack Trace</h3>
                                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto font-mono leading-relaxed">
                                            {selectedLog.errorStack || 'No stack trace available'}
                                        </pre>
                                    </div>

                                    {/* Component Stack */}
                                    {selectedLog.componentStack && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Component Stack</h3>
                                            <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg text-xs overflow-x-auto font-mono leading-relaxed border">
                                                {selectedLog.componentStack}
                                            </pre>
                                        </div>
                                    )}

                                    {/* Metadata */}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                        <div>
                                            <span className="text-xs text-gray-500 block">ID del Reporte</span>
                                            <span className="text-sm font-mono">{selectedLog.id}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">Fecha</span>
                                            <span className="text-sm">
                                                {format(new Date(selectedLog.timestamp), 'PPP pp', { locale: es })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">Usuario</span>
                                            <span className="text-sm">{selectedLog.user?.username || 'N/A'} (ID: {selectedLog.user?.id || '-'})</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">Tenant</span>
                                            <span className="text-sm">{selectedLog.tenant?.name || 'N/A'} (ID: {selectedLog.tenant?.id || '-'})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                                <Search size={64} className="mb-4 opacity-20" />
                                <p className="text-xl font-medium">Selecciona un error para ver detalles</p>
                                <p className="text-sm mt-2">Explora la lista de la izquierda</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
