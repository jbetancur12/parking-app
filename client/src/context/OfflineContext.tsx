import React, { createContext, useContext, useEffect, useState } from 'react';
import { OfflineService, type OfflineAction } from '../services/OfflineService';
import api from '../services/api'; import { toast } from 'sonner';

interface OfflineContextType {
    isOnline: boolean;
    isSyncing: boolean;
    queue: OfflineAction[];
    syncQueue: () => Promise<void>;
    addOfflineItem: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'status'>) => void;
    removeOfflineItem: (id: string) => void;
    clearOfflineQueue: () => void;
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

        // Get fallback IDs from current session
        const currentTenant = JSON.parse(localStorage.getItem('currentTenant') || '{}');
        const currentLocation = JSON.parse(localStorage.getItem('currentLocation') || '{}');

        for (const action of currentQueue) {
            try {
                // Backfill missing context if this is a "stale" action from before the update
                const tenantId = action.tenantId || currentTenant.id;
                const locationId = action.locationId || currentLocation.id;

                const headers = {
                    'x-tenant-id': tenantId,
                    'x-location-id': locationId
                };

                if (action.type === 'ENTRY') {
                    await api.post('/parking/entry', action.payload, { headers });
                } else if (action.type === 'EXIT') {
                    await api.post('/parking/exit', action.payload, { headers });
                }

                OfflineService.removeFromQueue(action.id);
                successCount++;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || 'Error desconocido';
                console.error('Sync error:', errorMessage);

                // Smart Conflict Handling
                // 1. If ENTRY fails because "Vehicle already has active session", assume it was already synced or manually entered.
                if (action.type === 'ENTRY' && errorMessage.includes('ya tiene una sesión activa')) {
                    // Treat as success to unblock queue
                    OfflineService.removeFromQueue(action.id);
                    successCount++; // Count as success since state is desired (vehicle is in)
                }
                // 2. If EXIT fails because "Session not found" or similar, it might have been already exited.
                // However, be careful not to delete legitimate errors. 
                // For now, let's keep EXIT errors pending unless we are sure.
                else {
                    OfflineService.updateStatus(action.id, 'ERROR', errorMessage);
                    errorCount++;
                }
            }
        }

        setQueue(OfflineService.getQueue());
        setIsSyncing(false);

        if (successCount > 0) toast.success(`${successCount} registros sincronizados.`);
        if (errorCount > 0) toast.error(`${errorCount} registros fallaron. Revise la consola.`);
    };

    const addOfflineItem = (action: Omit<OfflineAction, 'id' | 'timestamp' | 'status'>) => {
        OfflineService.addToQueue(action);
        setQueue(OfflineService.getQueue());
    };

    const removeOfflineItem = (id: string) => {
        OfflineService.removeFromQueue(id);
        setQueue(OfflineService.getQueue());
        toast.info('Registro offline eliminado.');
    };

    const clearOfflineQueue = () => {
        OfflineService.clearQueue();
        setQueue([]);
        toast.info('Cola offline limpiada correctamente.');
    };

    return (
        <OfflineContext.Provider value={{ isOnline, isSyncing, queue, syncQueue, addOfflineItem, removeOfflineItem, clearOfflineQueue }}>
            {children}
        </OfflineContext.Provider>
    );
}

export const useOffline = () => {
    const context = useContext(OfflineContext);
    if (!context) throw new Error('useOffline must be used within OfflineProvider');
    return context;
};
