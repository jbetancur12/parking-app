import React, { createContext, useContext, useEffect, useState } from 'react';
import { OfflineService, type OfflineAction } from '../services/OfflineService';
import api from '../services/api'; import { toast } from 'sonner';

interface OfflineContextType {
    isOnline: boolean;
    isSyncing: boolean;
    queue: OfflineAction[];
    syncQueue: () => Promise<void>;
    addOfflineItem: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'status'>) => void;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [queue, setQueue] = useState<OfflineAction[]>(OfflineService.getQueue());

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('Conexión restaurada. Sincronizando datos...');
            syncQueue();
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast.warning('Modo Offline activado. Los datos se guardarán localmente.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const syncQueue = async () => {
        const currentQueue = OfflineService.getQueue();
        if (currentQueue.length === 0) return;

        setIsSyncing(true);
        let successCount = 0;
        let errorCount = 0;

        for (const action of currentQueue) {
            try {
                if (action.type === 'ENTRY') {
                    await api.post('/parking/entry', action.payload);
                } else if (action.type === 'EXIT') {
                    await api.post('/parking/exit', action.payload);
                }

                OfflineService.removeFromQueue(action.id);
                successCount++;
            } catch (error: any) {
                console.error('Sync error', error);
                OfflineService.updateStatus(action.id, 'ERROR', error.response?.data?.message || 'Error desconocido');
                errorCount++;
            }
        }

        setQueue(OfflineService.getQueue());
        setIsSyncing(false);

        if (successCount > 0) toast.success(`${successCount} registros sincronizados.`);
        if (errorCount > 0) toast.error(`${errorCount} registros fallaron al sincronizar.`);
    };

    const addOfflineItem = (action: Omit<OfflineAction, 'id' | 'timestamp' | 'status'>) => {
        OfflineService.addToQueue(action);
        setQueue(OfflineService.getQueue());
    };

    return (
        <OfflineContext.Provider value={{ isOnline, isSyncing, queue, syncQueue, addOfflineItem }}>
            {children}
        </OfflineContext.Provider>
    );
}

export const useOffline = () => {
    const context = useContext(OfflineContext);
    if (!context) throw new Error('useOffline must be used within OfflineProvider');
    return context;
};
