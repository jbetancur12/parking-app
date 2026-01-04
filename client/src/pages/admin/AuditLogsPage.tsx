import { Shield } from 'lucide-react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { AuditLogList } from '../../components/admin/audit-logs/AuditLogList';

export default function AuditLogsPage() {
    const { logs, loading, fetchLogs } = useAuditLogs();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-brand-blue dark:text-blue-400 flex items-center">
                        <Shield className="mr-3 h-8 w-8" />
                        Log de Auditoría
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Registro de seguridad y acciones sensibles</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="px-4 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-800 transition-all text-sm shadow-md"
                >
                    Recargar
                </button>
            </div>

            <AuditLogList logs={logs} loading={loading} />
        </div>
    );
}
