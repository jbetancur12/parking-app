
export interface OfflineAction {
    id: string;
    type: 'ENTRY' | 'EXIT';
    payload: any;
    timestamp: number;
    status: 'PENDING' | 'SYNCED' | 'ERROR';
    errorMessage?: string;
    tenantId: string;
    locationId: string;
}

const STORAGE_KEY = 'parking_offline_queue';

export const OfflineService = {
    getQueue: (): OfflineAction[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    addToQueue: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'status'>) => {
        const queue = OfflineService.getQueue();
        const newAction: OfflineAction = {
            ...action,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            status: 'PENDING'
        };
        queue.push(newAction);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
        return newAction;
    },

    removeFromQueue: (id: string) => {
        const queue = OfflineService.getQueue();
        const filtered = queue.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },

    updateStatus: (id: string, status: OfflineAction['status'], error?: string) => {
        const queue = OfflineService.getQueue();
        const index = queue.findIndex(item => item.id === id);
        if (index !== -1) {
            queue[index].status = status;
            if (error) queue[index].errorMessage = error;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
        }
    },

    clearQueue: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
