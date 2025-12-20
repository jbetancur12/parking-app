import { Wifi, WifiOff, RefreshCw, UploadCloud } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';


export const OfflineIndicator = () => {
    const { isOnline, isSyncing, queue, syncQueue } = useOffline();

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
