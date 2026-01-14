import React from 'react';
import { Menu, MapPin, Trash } from 'lucide-react';
import { OfflineIndicator } from '../../OfflineIndicator';
import { useOffline } from '../../../context/OfflineContext';

const ClearQueueButton = () => {
    const { queue, clearOfflineQueue } = useOffline();

    if (queue.length === 0) return null;

    return (
        <button
            onClick={() => {
                if (window.confirm('¿Desea eliminar TODAS las acciones pendientes de sincronización? Esto borrará los datos no guardados.')) {
                    clearOfflineQueue();
                }
            }}
            className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
            title="Limpiar cola de sincronización"
        >
            <Trash size={14} />
            <span className="hidden sm:inline">Limpiar ({queue.length})</span>
        </button>
    );
};

interface DashboardHeaderProps {
    toggleSidebar: () => void;
    currentLocation: any;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ toggleSidebar, currentLocation }) => {
    return (
        <header className="flex h-16 items-center justify-between bg-white dark:bg-gray-800 px-6 shadow-sm lg:hidden transition-colors duration-200">
            <button onClick={toggleSidebar} className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white">
                <Menu size={24} />
            </button>
            <div className="flex flex-col items-center">
                <img src="/logo_cuadra.png" alt="Cuadra" className="h-8 w-auto mb-1" />
                {currentLocation && (
                    <span className="text-xs text-green-600 font-medium flex items-center">
                        <MapPin size={10} className="mr-1" />
                        {currentLocation.name}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2">
                <OfflineIndicator />
                <ClearQueueButton />
            </div>
        </header>
    );
};
