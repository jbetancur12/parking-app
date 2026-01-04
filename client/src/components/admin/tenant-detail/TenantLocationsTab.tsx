import React from 'react';
import { Plus, MapPin, Trash2, RotateCcw } from 'lucide-react';
import type { Tenant, Location } from '../../../hooks/useTenantDetail';

interface TenantLocationsTabProps {
    tenant: Tenant;
    setShowAddLocationModal: (show: boolean) => void;
    handleDeleteLocation: (id: string) => void;
    handleReactivateLocation: (location: Location) => void;
}

export const TenantLocationsTab: React.FC<TenantLocationsTabProps> = ({
    tenant,
    setShowAddLocationModal,
    handleDeleteLocation,
    handleReactivateLocation
}) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-display font-bold text-brand-blue dark:text-blue-300">Sedes</h3>
                <button
                    onClick={() => setShowAddLocationModal(true)}
                    className="flex items-center px-4 py-2 bg-brand-yellow dark:bg-yellow-500 text-brand-blue dark:text-gray-900 font-bold rounded-lg hover:bg-yellow-400 dark:hover:bg-yellow-400 shadow-md transition-transform active:scale-95"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Nueva Sede
                </button>
            </div>

            {tenant.locations && tenant.locations.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tenant.locations.map(loc => (
                        <div key={loc.id} className="bg-white dark:bg-gray-700/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 flex justify-between items-start hover:shadow-md transition-all">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{loc.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {loc.address || 'Sin dirección'}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${loc.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                    {loc.isActive ? 'Activa' : 'Inactiva'}
                                </span>
                                <div className="flex gap-1">
                                    {loc.isActive ? (
                                        <button
                                            onClick={() => handleDeleteLocation(loc.id)}
                                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                                            title="Desactivar Sede"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleReactivateLocation(loc)}
                                            className="text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/50 transition-colors"
                                            title="Reactivar Sede"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No hay sedes registradas para esta empresa.</p>
            )}
        </div>
    );
};
