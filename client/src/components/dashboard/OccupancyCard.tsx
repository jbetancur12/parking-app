import React from 'react';
import { Skeleton } from '../Skeleton';

interface OccupancyCardProps {
    occupancy: any;
    loading?: boolean;
}

export const OccupancyCard: React.FC<OccupancyCardProps> = ({ occupancy, loading }) => {
    if (loading || !occupancy) return <Skeleton className="h-48 w-full rounded-lg" />;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-t-4 border-brand-yellow">
            <h3 className="text-lg font-display font-bold text-brand-blue dark:text-white mb-4">Ocupación en Tiempo Real</h3>
            <div className="space-y-6">
                {/* Cars */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Carros</span>
                        <span className="text-sm font-bold text-brand-blue dark:text-blue-300">{occupancy.car.current} / {occupancy.checkEnabled ? occupancy.car.capacity : '∞'}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${(occupancy.car.current / occupancy.car.capacity) > 0.9 ? 'bg-red-500' :
                                (occupancy.car.current / occupancy.car.capacity) > 0.7 ? 'bg-brand-yellow' : 'bg-brand-blue'
                                }`}
                            style={{ width: `${occupancy.checkEnabled ? Math.min((occupancy.car.current / occupancy.car.capacity) * 100, 100) : 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Motorcycles */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Motos</span>
                        <span className="text-sm font-bold text-brand-yellow">{occupancy.motorcycle.current} / {occupancy.checkEnabled ? occupancy.motorcycle.capacity : '∞'}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${(occupancy.motorcycle.current / occupancy.motorcycle.capacity) > 0.9 ? 'bg-red-500' :
                                (occupancy.motorcycle.current / occupancy.motorcycle.capacity) > 0.7 ? 'bg-brand-yellow' : 'bg-brand-yellow'
                                }`}
                            style={{ width: `${occupancy.checkEnabled ? Math.min((occupancy.motorcycle.current / occupancy.motorcycle.capacity) * 100, 100) : 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
