import { Wifi, WifiOff, RefreshCw, UploadCloud } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';


interface OfflineIndicatorProps {
    variant?: 'default' | 'minimal';
    className?: string; // Allow custom classes
}

export const OfflineIndicator = ({ variant = 'default', className = '' }: OfflineIndicatorProps) => {
    const { isOnline, isSyncing, queue, syncQueue } = useOffline();

    // --- Minimal Variant (Small Dot / Icon) ---
    if (variant === 'minimal') {
        if (isSyncing) {
            return (
                <div title="Sincronizando..." className={`flex items-center gap-2 ${className}`}>
                    <RefreshCw size={14} className="text-brand-yellow animate-spin" />
                </div>
            );
        }
        if (!isOnline) {
            return (
                <div title={`Offline (${queue.length} pendientes)`} className={`flex items-center gap-2 ${className}`}>
                    <WifiOff size={14} className="text-red-400" />
                    {queue.length > 0 && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-900/20 px-1 rounded">
                            {queue.length}
                        </span>
                    )}
                </div>
            );
        }
        if (queue.length > 0) {
            return (
                <button
                    onClick={syncQueue}
                    title="Click para sincronizar pendientes"
                    className={`flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
                >
                    <UploadCloud size={14} className="text-orange-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-orange-400">{queue.length}</span>
                </button>
            );
        }
        // Online & Idle - Simple Green Dot
        return (
            <div title="Online" className={`flex items-center group ${className}`}>
                <div className="h-2 w-2 rounded-full bg-brand-green shadow-[0_0_8px_rgba(72,187,120,0.6)] group-hover:scale-110 transition-transform" />
            </div>
        );
    }

    // --- Default Variant (Pill / Badge) ---
    if (isSyncing) {
        return (
            <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200 shadow-sm animate-pulse">
                <RefreshCw size={16} className="text-yellow-600 animate-spin" />
                <span className="text-sm font-medium text-yellow-700">Sincronizando...</span>
            </div>
        );
    }

    if (!isOnline) {
        return (
            <div className="flex items-center space-x-2 bg-red-100 px-3 py-1 rounded-full border border-red-200 shadow-sm">
                <WifiOff size={16} className="text-red-600" />
                <span className="text-sm font-medium text-red-700">Offline ({queue.length})</span>
            </div>
        );
    }

    if (queue.length > 0) {
        return (
            <button
                onClick={syncQueue}
                title="Click para reintentar sincronización"
                className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full border border-orange-200 shadow-sm hover:bg-orange-200 transition-colors cursor-pointer"
            >
                <UploadCloud size={16} className="text-orange-600 animate-pulse" />
                <span className="text-sm font-medium text-orange-700">Pendiente ({queue.length})</span>
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full border border-green-200 shadow-sm">
                <Wifi size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-700">Online</span>
            </div>
        </div>
    );
};
