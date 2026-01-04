import React from 'react';
import { WifiOff } from 'lucide-react';

interface DashboardOfflineBannerProps {
    isOnline: boolean;
}

export const DashboardOfflineBanner: React.FC<DashboardOfflineBannerProps> = ({ isOnline }) => {
    if (isOnline) return null;

    return (
        <div className="bg-orange-500 text-white text-[10px] font-bold text-center py-1 shadow-md z-40 relative flex justify-center items-center gap-2 tracking-wider uppercase transition-all duration-300">
            <WifiOff size={12} />
            Sin Conexión &bull; No Recargar ni Cambiar de Sección
        </div>
    );
};
